from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.db import get_db
from backend.models import Category, Unit, Product, User
from backend.schemas import (
    CategoryCreate, CategoryResponse,
    UnitCreate, UnitResponse, UnitConvertRequest, UnitConvertResponse,
    ProductCreate, ProductUpdate, ProductResponse
)
from backend.utils.auth_middleware import get_current_user, require_shopkeeper
from backend.utils.unit_converter import convert_unit_standalone, round_currency, round_stock

router = APIRouter(prefix="/api", tags=["Catalog & Inventory"])

# ============================================================================
# CATEGORIES ENDPOINTS
# ============================================================================

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all categories with preset flags and colors."""
    return db.query(Category).order_by(Category.name.asc()).all()

@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Create a new category (supports quick presets and custom additions). Requires Shopkeeper role."""
    existing = db.query(Category).filter(Category.name == payload.name.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{payload.name}' already exists."
        )
    
    category = Category(
        name=payload.name.strip(),
        color_hex=payload.color_hex or "#0F766E",
        is_quick_preset=payload.is_quick_preset or False
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

# ============================================================================
# UNITS & CONVERSION ENDPOINTS
# ============================================================================

@router.get("/units", response_model=List[UnitResponse])
def get_units(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all measurement units and conversion multipliers."""
    return db.query(Unit).order_by(Unit.id.asc()).all()

@router.post("/units/convert", response_model=UnitConvertResponse)
def convert_quantity(
    payload: UnitConvertRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Utility endpoint to convert sub-unit quantities into base unit quantities.
    Example: 250 gram -> 0.250 kg; 2 cartons -> 48 pieces.
    """
    source_unit = db.query(Unit).filter(Unit.id == payload.source_unit_id).first()
    if not source_unit:
        raise HTTPException(status_code=404, detail="Source unit not found.")
    
    base_id, base_name, converted_qty = convert_unit_standalone(
        db,
        source_unit_id=payload.source_unit_id,
        quantity=payload.quantity,
        product_id=payload.product_id
    )

    return UnitConvertResponse(
        source_unit_id=payload.source_unit_id,
        source_unit_name=source_unit.name,
        quantity=payload.quantity,
        base_unit_id=base_id,
        base_unit_name=base_name,
        converted_base_quantity=converted_qty
    )

# ============================================================================
# PRODUCTS & LIVE INVENTORY ENDPOINTS
# ============================================================================

def format_product_response(product: Product, is_staff: bool) -> dict:
    """Format product dictionary, stripping purchase price & margin for staff users."""
    stock = Decimal(str(product.stock_qty))
    min_alert = Decimal(str(product.min_stock_alert))
    sale_price = Decimal(str(product.sale_price))
    purchase_price = Decimal(str(product.purchase_price))

    profit_margin = None
    if not is_staff and purchase_price > Decimal("0"):
        profit_margin = round_currency(sale_price - purchase_price)

    return {
        "id": product.id,
        "name": product.name,
        "category_id": product.category_id,
        "category_name": product.category.name if product.category else None,
        "category_color": product.category.color_hex if product.category else "#0F766E",
        "base_unit_id": product.base_unit_id,
        "base_unit_name": product.base_unit.name if product.base_unit else None,
        "base_unit_code": product.base_unit.short_code if product.base_unit else None,
        "barcode": product.barcode,
        # Strip purchase_price and profit_margin if requesting user is staff
        "purchase_price": None if is_staff else purchase_price,
        "sale_price": sale_price,
        "profit_margin": profit_margin,
        "stock_qty": stock,
        "min_stock_alert": min_alert,
        "pieces_per_carton": Decimal(str(product.pieces_per_carton)),
        "is_active": product.is_active,
        "is_low_stock": stock <= min_alert,
        "updated_at": product.updated_at
    }

@router.get("/products")
def get_products(
    search: Optional[str] = Query(None, description="Search by barcode or product name"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    low_stock_only: Optional[bool] = Query(False, description="Filter low-stock products"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search and filter products with instant barcode lookup and low stock alerts.
    When user role is 'staff', purchase_price and profit_margin are strictly stripped.
    """
    query = db.query(Product).filter(Product.is_active == True)

    if category_id:
        query = query.filter(Product.category_id == category_id)

    if search:
        search_clean = search.strip()
        # Barcode exact match or Name wildcard search
        query = query.filter(
            or_(
                Product.barcode == search_clean,
                Product.name.ilike(f"%{search_clean}%")
            )
        )

    if low_stock_only:
        query = query.filter(Product.stock_qty <= Product.min_stock_alert)

    products = query.order_by(Product.name.asc()).all()
    is_staff = (current_user.role == "staff")

    return [format_product_response(p, is_staff=is_staff) for p in products]

@router.get("/products/{id}")
def get_product_by_id(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve single product by ID."""
    product = db.query(Product).filter(Product.id == id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    
    is_staff = (current_user.role == "staff")
    return format_product_response(product, is_staff=is_staff)

@router.post("/products", status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Add a new product to inventory. Requires Shopkeeper role."""
    # Check barcode uniqueness
    existing_barcode = db.query(Product).filter(Product.barcode == payload.barcode.strip()).first()
    if existing_barcode:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with barcode '{payload.barcode}' already exists ({existing_barcode.name})."
        )
    
    # Check category and unit existence
    if not db.query(Category).filter(Category.id == payload.category_id).first():
        raise HTTPException(status_code=400, detail="Invalid category_id.")
    if not db.query(Unit).filter(Unit.id == payload.base_unit_id).first():
        raise HTTPException(status_code=400, detail="Invalid base_unit_id.")

    product = Product(
        name=payload.name.strip(),
        category_id=payload.category_id,
        base_unit_id=payload.base_unit_id,
        barcode=payload.barcode.strip(),
        purchase_price=round_currency(payload.purchase_price),
        sale_price=round_currency(payload.sale_price),
        stock_qty=round_stock(payload.stock_qty),
        min_stock_alert=round_stock(payload.min_stock_alert),
        pieces_per_carton=round_stock(payload.pieces_per_carton),
        is_active=payload.is_active if payload.is_active is not None else True
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return format_product_response(product, is_staff=False)

@router.put("/products/{id}")
def update_product(
    id: int,
    payload: ProductUpdate,
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Update product information, prices, and thresholds. Requires Shopkeeper role."""
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    if payload.barcode and payload.barcode.strip() != product.barcode:
        existing = db.query(Product).filter(
            Product.barcode == payload.barcode.strip(),
            Product.id != id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Barcode already assigned to another product.")
        product.barcode = payload.barcode.strip()

    if payload.name is not None:
        product.name = payload.name.strip()
    if payload.category_id is not None:
        product.category_id = payload.category_id
    if payload.base_unit_id is not None:
        product.base_unit_id = payload.base_unit_id
    if payload.purchase_price is not None:
        product.purchase_price = round_currency(payload.purchase_price)
    if payload.sale_price is not None:
        product.sale_price = round_currency(payload.sale_price)
    if payload.stock_qty is not None:
        product.stock_qty = round_stock(payload.stock_qty)
    if payload.min_stock_alert is not None:
        product.min_stock_alert = round_stock(payload.min_stock_alert)
    if payload.pieces_per_carton is not None:
        product.pieces_per_carton = round_stock(payload.pieces_per_carton)
    if payload.is_active is not None:
        product.is_active = payload.is_active

    db.commit()
    db.refresh(product)
    return format_product_response(product, is_staff=False)

@router.delete("/products/{id}")
def delete_product(
    id: int,
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Soft-delete product by marking is_active = False. Requires Shopkeeper role."""
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    
    product.is_active = False
    db.commit()
    return {"message": f"Product '{product.name}' has been successfully archived."}

@router.get("/inventory/low-stock")
def get_low_stock_inventory(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fast lookup for all products that have reached or fallen below minimum alert levels."""
    products = (
        db.query(Product)
        .filter(Product.is_active == True, Product.stock_qty <= Product.min_stock_alert)
        .order_by(Product.stock_qty.asc())
        .all()
    )
    is_staff = (current_user.role == "staff")
    return [format_product_response(p, is_staff=is_staff) for p in products]
