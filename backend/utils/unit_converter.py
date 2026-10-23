from decimal import Decimal, ROUND_HALF_UP
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from backend.models import Unit, Product

QUANTIZE_STOCK = Decimal("0.001")
QUANTIZE_CURRENCY = Decimal("0.01")

def round_stock(val: Decimal) -> Decimal:
    """Ensure exact DECIMAL(10,3) precision for inventory quantities."""
    return Decimal(str(val)).quantize(QUANTIZE_STOCK, rounding=ROUND_HALF_UP)

def round_currency(val: Decimal) -> Decimal:
    """Ensure exact DECIMAL(12,2) precision for monetary amounts."""
    return Decimal(str(val)).quantize(QUANTIZE_CURRENCY, rounding=ROUND_HALF_UP)

def convert_to_base_unit(
    db: Session,
    product: Product,
    source_unit_id: int,
    quantity: Decimal
) -> Decimal:
    """
    Convert any sold or purchased quantity in source_unit into the product's base inventory unit.
    Examples:
      - 250 gram -> 0.250 kg (multiplier 0.0010)
      - 2 cartons of 24 pieces -> 48.000 pieces
      - 3 dozen eggs -> 36.000 pieces (multiplier 12.0000)
    """
    qty = Decimal(str(quantity))
    
    # If source unit matches base unit directly
    if source_unit_id == product.base_unit_id:
        return round_stock(qty)

    source_unit = db.query(Unit).filter(Unit.id == source_unit_id).first()
    if not source_unit:
        return round_stock(qty)

    # Special handling for Carton: use product's pieces_per_carton if specified
    if source_unit.short_code.lower() in ["ctn", "carton"]:
        if product.pieces_per_carton and Decimal(str(product.pieces_per_carton)) > Decimal("0"):
            carton_factor = Decimal(str(product.pieces_per_carton))
            return round_stock(qty * carton_factor)

    # Use conversion multiplier configured on unit
    multiplier = Decimal(str(source_unit.conversion_multiplier or 1.0))
    return round_stock(qty * multiplier)

def convert_unit_standalone(
    db: Session,
    source_unit_id: int,
    quantity: Decimal,
    product_id: Optional[int] = None
) -> Tuple[int, str, Decimal]:
    """
    Helper for standalone conversion API /api/units/convert.
    Returns: (base_unit_id, base_unit_name, converted_quantity)
    """
    source_unit = db.query(Unit).filter(Unit.id == source_unit_id).first()
    if not source_unit:
        return (source_unit_id, "Unknown", round_stock(quantity))

    if product_id:
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            converted = convert_to_base_unit(db, product, source_unit_id, quantity)
            base_name = product.base_unit.name if product.base_unit else source_unit.name
            return (product.base_unit_id, base_name, converted)

    # If unit has base_unit_id
    if source_unit.base_unit_id and source_unit.base_unit:
        target_unit = source_unit.base_unit
        converted = round_stock(Decimal(str(quantity)) * Decimal(str(source_unit.conversion_multiplier)))
        return (target_unit.id, target_unit.name, converted)

    # Already base unit
    return (source_unit.id, source_unit.name, round_stock(quantity))
