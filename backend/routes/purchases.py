import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.models import (
    Purchase, PurchaseItem, Product, Supplier, User, KhataLedger
)
from backend.schemas import (
    PurchaseCreate, PurchaseResponse, PurchaseItemResponse
)
from backend.utils.auth_middleware import require_shopkeeper
from backend.utils.unit_converter import convert_to_base_unit, round_currency, round_stock

router = APIRouter(prefix="/api/purchases", tags=["Purchases & Stock-In"])

@router.get("", response_model=List[PurchaseResponse])
def get_purchases(
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Retrieve all stock-in purchase invoices. Requires Shopkeeper role."""
    purchases = db.query(Purchase).order_by(Purchase.purchase_date.desc()).all()
    
    result = []
    for p in purchases:
        items_out = []
        for it in p.items:
            items_out.append(
                PurchaseItemResponse(
                    id=it.id,
                    product_id=it.product_id,
                    product_name=it.product.name if it.product else None,
                    unit_id=it.unit_id,
                    unit_code=it.unit.short_code if it.unit else None,
                    quantity=Decimal(str(it.quantity)),
                    base_qty_added=Decimal(str(it.base_qty_added)),
                    unit_cost=Decimal(str(it.unit_cost)),
                    line_total=Decimal(str(it.line_total))
                )
            )
        result.append(
            PurchaseResponse(
                id=p.id,
                invoice_no=p.invoice_no,
                supplier_id=p.supplier_id,
                supplier_name=p.supplier.name if p.supplier else None,
                total_cost=Decimal(str(p.total_cost)),
                amount_paid=Decimal(str(p.amount_paid)),
                balance_owed=Decimal(str(p.balance_owed)),
                purchase_date=p.purchase_date,
                notes=p.notes,
                items=items_out
            )
        )
    return result

@router.post("", response_model=PurchaseResponse, status_code=status.HTTP_201_CREATED)
def create_stock_in_purchase(
    payload: PurchaseCreate,
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """
    Execute an Atomic Stock-In Transaction:
      1. Validate supplier existence.
      2. For each item:
         - Convert quantity to base inventory unit (base_qty_added).
         - Calculate new Weighted Average Purchase Price:
           new_cost = ((old_stock * old_cost) + (base_qty_added * cost_per_base_unit)) / (old_stock + base_qty_added)
         - Update product.stock_qty += base_qty_added and product.purchase_price = new_cost.
      3. Insert Purchase and PurchaseItems rows.
      4. Compute balance_owed = total_cost - amount_paid.
      5. If balance_owed > 0:
         - Increment supplier.current_balance += balance_owed.
         - Insert 'purchase_credit' entry into khata_ledger.
      6. Commit ACID transaction.
    """
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Purchase order must contain at least one product item."
        )

    supplier = db.query(Supplier).filter(Supplier.id == payload.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    invoice_no = payload.invoice_no.strip() if payload.invoice_no else f"PO-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    try:
        total_cost = Decimal("0.00")
        processed_items = []

        for item_in in payload.items:
            product = db.query(Product).filter(Product.id == item_in.product_id).with_for_update().first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product with ID {item_in.product_id} not found.")

            qty = Decimal(str(item_in.quantity))
            unit_cost = Decimal(str(item_in.unit_cost))
            line_total = round_currency(qty * unit_cost)
            total_cost += line_total

            # High precision conversion to product's base unit
            base_qty_added = convert_to_base_unit(db, product, item_in.unit_id, qty)

            # Weighted Average Cost Calculation
            old_stock = max(Decimal("0.000"), Decimal(str(product.stock_qty)))
            old_cost = Decimal(str(product.purchase_price))
            new_total_stock = old_stock + base_qty_added

            if new_total_stock > Decimal("0"):
                cost_of_existing = old_stock * old_cost
                cost_of_incoming = line_total
                weighted_avg_cost = (cost_of_existing + cost_of_incoming) / new_total_stock
                product.purchase_price = round_currency(weighted_avg_cost)
            else:
                product.purchase_price = round_currency(unit_cost)

            # Increment stock
            product.stock_qty = round_stock(Decimal(str(product.stock_qty)) + base_qty_added)

            processed_items.append({
                "product_id": product.id,
                "unit_id": item_in.unit_id,
                "quantity": round_stock(qty),
                "base_qty_added": base_qty_added,
                "unit_cost": round_currency(unit_cost),
                "line_total": line_total,
                "product_name": product.name
            })

        total_cost = round_currency(total_cost)
        amount_paid = round_currency(Decimal(str(payload.amount_paid)))
        balance_owed = round_currency(max(Decimal("0.00"), total_cost - amount_paid))

        # Create Purchase record
        purchase = Purchase(
            invoice_no=invoice_no,
            supplier_id=supplier.id,
            user_id=current_user.id,
            total_cost=total_cost,
            amount_paid=amount_paid,
            balance_owed=balance_owed,
            purchase_date=datetime.utcnow(),
            notes=payload.notes
        )
        db.add(purchase)
        db.flush() # obtain purchase.id

        # Create Purchase items
        output_items = []
        for pi in processed_items:
            db_item = PurchaseItem(
                purchase_id=purchase.id,
                product_id=pi["product_id"],
                unit_id=pi["unit_id"],
                quantity=pi["quantity"],
                base_qty_added=pi["base_qty_added"],
                unit_cost=pi["unit_cost"],
                line_total=pi["line_total"]
            )
            db.add(db_item)
            output_items.append(
                PurchaseItemResponse(
                    id=0,
                    product_id=pi["product_id"],
                    product_name=pi["product_name"],
                    unit_id=pi["unit_id"],
                    unit_code=None,
                    quantity=pi["quantity"],
                    base_qty_added=pi["base_qty_added"],
                    unit_cost=pi["unit_cost"],
                    line_total=pi["line_total"]
                )
            )

        # Update Supplier Balance & Ledger if balance owed
        if balance_owed > Decimal("0.00"):
            supplier.current_balance = round_currency(
                Decimal(str(supplier.current_balance)) + balance_owed
            )
            ledger_entry = KhataLedger(
                party_type="supplier",
                party_id=supplier.id,
                entry_type="purchase_credit",
                reference_bill_id=purchase.id,
                debit_amount=Decimal("0.00"),
                credit_amount=balance_owed,
                running_balance=supplier.current_balance,
                notes=f"Stock-in Invoice #{invoice_no} (Total: {total_cost}, Paid: {amount_paid})",
                created_at=datetime.utcnow()
            )
            db.add(ledger_entry)

        # Atomic commit
        db.commit()
        db.refresh(purchase)

        return PurchaseResponse(
            id=purchase.id,
            invoice_no=purchase.invoice_no,
            supplier_id=supplier.id,
            supplier_name=supplier.name,
            total_cost=Decimal(str(purchase.total_cost)),
            amount_paid=Decimal(str(purchase.amount_paid)),
            balance_owed=Decimal(str(purchase.balance_owed)),
            purchase_date=purchase.purchase_date,
            notes=purchase.notes,
            items=output_items
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stock-in transaction failed: {str(e)}"
        )
