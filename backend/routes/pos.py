from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.db import get_db
from backend.models import (
    Sale, SaleItem, Product, Customer, User, KhataLedger, Unit
)
from backend.schemas import (
    SaleCreate, SaleResponse, SaleItemResponse, ReceiptResponse
)
from backend.utils.auth_middleware import get_current_user
from backend.utils.unit_converter import convert_to_base_unit, round_currency, round_stock

router = APIRouter(prefix="/api/sales", tags=["POS & Checkout"])

def generate_bill_no(db: Session) -> str:
    """Generate a clean sequential daily invoice number: INV-YYYYMMDD-001."""
    today_prefix = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-"
    # Find existing count for today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    count = db.query(Sale).filter(Sale.sale_date >= today_start).count()
    return f"{today_prefix}{str(count + 1).zfill(3)}"

@router.get("", response_model=List[SaleResponse])
def get_sales_history(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve POS sale invoices history."""
    sales = db.query(Sale).order_by(Sale.sale_date.desc()).limit(limit).all()
    
    result = []
    for s in sales:
        items_out = []
        for it in s.items:
            items_out.append(
                SaleItemResponse(
                    id=it.id,
                    product_id=it.product_id,
                    product_name=it.product.name if it.product else None,
                    sold_unit_id=it.sold_unit_id,
                    unit_code=it.sold_unit.short_code if it.sold_unit else None,
                    quantity=Decimal(str(it.quantity)),
                    base_qty_deducted=Decimal(str(it.base_qty_deducted)),
                    unit_sale_price=Decimal(str(it.unit_sale_price)),
                    line_total=Decimal(str(it.line_total))
                )
            )
        result.append(
            SaleResponse(
                id=s.id,
                bill_no=s.bill_no,
                customer_id=s.customer_id,
                customer_name=s.customer.name if s.customer else "Walk-in Customer",
                subtotal=Decimal(str(s.subtotal)),
                discount=Decimal(str(s.discount)),
                grand_total=Decimal(str(s.grand_total)),
                payment_mode=s.payment_mode,
                cash_paid=Decimal(str(s.cash_paid)),
                udhaar_added=Decimal(str(s.udhaar_added)),
                due_date=s.due_date,
                sale_date=s.sale_date,
                items=items_out
            )
        )
    return result

@router.get("/{id}/receipt", response_model=ReceiptResponse)
def get_receipt(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate 80mm thermal receipt payload for any existing sale invoice."""
    sale = db.query(Sale).filter(Sale.id == id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale invoice not found.")

    customer = sale.customer
    prev_balance = Decimal("0.00")
    closing_balance = Decimal("0.00")
    if customer:
        closing_balance = Decimal(str(customer.current_udhaar_balance))
        prev_balance = closing_balance - Decimal(str(sale.udhaar_added))

    formatted_items = []
    for it in sale.items:
        formatted_items.append({
            "name": it.product.name if it.product else "Item",
            "quantity": float(it.quantity),
            "unit": it.sold_unit.short_code if it.sold_unit else "pc",
            "unit_price": float(it.unit_sale_price),
            "line_total": float(it.line_total)
        })

    return ReceiptResponse(
        bill_no=sale.bill_no,
        store_name="Al-Madina Super Store",
        store_phone="0300-8451299",
        cashier_name=sale.user.name if sale.user else current_user.name,
        sale_date=sale.sale_date,
        customer_name=customer.name if customer else "Walk-in Customer",
        customer_phone=customer.phone if customer else None,
        payment_mode=sale.payment_mode,
        items=formatted_items,
        subtotal=Decimal(str(sale.subtotal)),
        discount=Decimal(str(sale.discount)),
        grand_total=Decimal(str(sale.grand_total)),
        cash_paid=Decimal(str(sale.cash_paid)),
        change_returned=max(Decimal("0.00"), Decimal(str(sale.cash_paid)) - Decimal(str(sale.grand_total))),
        current_bill_udhaar=Decimal(str(sale.udhaar_added)),
        previous_khata_balance=prev_balance,
        closing_khata_balance=closing_balance,
        due_date=sale.due_date
    )

@router.post("", response_model=ReceiptResponse, status_code=status.HTTP_201_CREATED)
def checkout_pos_sale(
    payload: SaleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Execute an Atomic POS Checkout Transaction:
      1. Validate cart is non-empty.
      2. For each item:
         - Convert quantity to base inventory unit (base_qty_deducted).
         - Validate that product has sufficient stock_qty >= base_qty_deducted (HTTP 400 with product name).
         - Deduct product.stock_qty -= base_qty_deducted.
         - Snapshot product.purchase_price as unit_cost_snapshot.
      3. Compute subtotal, discount, grand_total, cash_paid, udhaar_added.
      4. If udhaar_added > 0:
         - Verify customer_id is provided and customer exists.
         - Verify due_date is provided.
         - Check customer credit_limit.
         - Update customer.current_udhaar_balance += udhaar_added.
         - Update customer.promised_due_date = due_date.
         - Insert 'credit_sale' entry into khata_ledger.
      5. Insert Sale and SaleItem records.
      6. Commit transaction and return full 80mm thermal receipt JSON.
    """
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="POS Cart is empty. Add at least one product."
        )

    try:
        subtotal = Decimal("0.00")
        processed_items = []

        # 1. Inspect and reserve inventory for each item
        for item_in in payload.items:
            product = db.query(Product).filter(
                Product.id == item_in.product_id,
                Product.is_active == True
            ).with_for_update().first()

            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product with ID {item_in.product_id} was not found or is inactive."
                )

            unit_id = item_in.sold_unit_id or product.base_unit_id
            qty = Decimal(str(item_in.quantity))
            base_qty_deducted = convert_to_base_unit(db, product, unit_id, qty)

            # Stock availability check
            current_stock = Decimal(str(product.stock_qty))
            if current_stock < base_qty_deducted:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Insufficient stock for '{product.name}'. "
                        f"Requested: {base_qty_deducted} {product.base_unit.short_code if product.base_unit else 'units'}, "
                        f"Available: {current_stock}"
                    )
                )

            # Sale unit price
            sale_price = item_in.unit_sale_price
            if sale_price is None:
                # If sold in same base unit, use sale_price
                if unit_id == product.base_unit_id:
                    sale_price = Decimal(str(product.sale_price))
                else:
                    # Calculate proportional price based on base qty deducted
                    unit_ratio = base_qty_deducted / qty if qty > 0 else Decimal("1.000")
                    sale_price = Decimal(str(product.sale_price)) * unit_ratio

            sale_price = round_currency(Decimal(str(sale_price)))
            line_total = round_currency(qty * sale_price)
            subtotal += line_total

            # Snapshot purchase price for exact profit & COGS analytics
            cost_snapshot = round_currency(Decimal(str(product.purchase_price)))

            # Deduct stock
            product.stock_qty = round_stock(current_stock - base_qty_deducted)

            unit_model = db.query(Unit).filter(Unit.id == unit_id).first()

            processed_items.append({
                "product_id": product.id,
                "product_name": product.name,
                "unit_id": unit_id,
                "unit_code": unit_model.short_code if unit_model else "pc",
                "quantity": round_stock(qty),
                "base_qty_deducted": base_qty_deducted,
                "unit_cost_snapshot": cost_snapshot,
                "unit_sale_price": sale_price,
                "line_total": line_total
            })

        subtotal = round_currency(subtotal)
        discount = round_currency(Decimal(str(payload.discount or Decimal("0.00"))))
        grand_total = round_currency(max(Decimal("0.00"), subtotal - discount))

        payment_mode = payload.payment_mode.lower().strip()
        if payment_mode not in ["cash", "udhaar", "partial"]:
            payment_mode = "cash"

        cash_paid = round_currency(Decimal(str(payload.cash_paid or Decimal("0.00"))))
        
        # Calculate udhaar portion
        if payment_mode == "cash":
            udhaar_added = Decimal("0.00")
            if cash_paid < grand_total:
                cash_paid = grand_total # Full cash settled
        elif payment_mode == "udhaar":
            cash_paid = Decimal("0.00")
            udhaar_added = grand_total
        elif payment_mode == "partial":
            udhaar_added = round_currency(max(Decimal("0.00"), grand_total - cash_paid))
        else:
            udhaar_added = Decimal("0.00")

        # Customer validation for Udhaar
        customer = None
        previous_balance = Decimal("0.00")
        closing_balance = Decimal("0.00")

        if udhaar_added > Decimal("0.00"):
            if not payload.customer_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Customer must be selected for Udhaar / Credit sales."
                )
            
            customer = db.query(Customer).filter(Customer.id == payload.customer_id).with_for_update().first()
            if not customer:
                raise HTTPException(status_code=404, detail="Selected Customer account not found.")

            previous_balance = Decimal(str(customer.current_udhaar_balance))
            closing_balance = round_currency(previous_balance + udhaar_added)

            # Credit limit check
            credit_limit = Decimal(str(customer.credit_limit))
            if closing_balance > credit_limit:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Credit limit exceeded for '{customer.name}'. "
                        f"Limit: Rs {credit_limit}, Current: Rs {previous_balance}, "
                        f"New Balance: Rs {closing_balance}"
                    )
                )

            # Update customer balance and promised due date
            customer.current_udhaar_balance = closing_balance
            if payload.due_date:
                customer.promised_due_date = payload.due_date

        elif payload.customer_id:
            customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
            if customer:
                previous_balance = Decimal(str(customer.current_udhaar_balance))
                closing_balance = previous_balance

        # Generate unique bill number
        bill_no = generate_bill_no(db)

        # Insert Sale record
        sale = Sale(
            bill_no=bill_no,
            customer_id=customer.id if customer else None,
            user_id=current_user.id,
            subtotal=subtotal,
            discount=discount,
            grand_total=grand_total,
            payment_mode=payment_mode,
            cash_paid=cash_paid,
            udhaar_added=udhaar_added,
            due_date=payload.due_date,
            sale_date=datetime.utcnow()
        )
        db.add(sale)
        db.flush() # obtain sale.id

        # Insert Sale Items
        receipt_items = []
        for it in processed_items:
            db_item = SaleItem(
                sale_id=sale.id,
                product_id=it["product_id"],
                sold_unit_id=it["unit_id"],
                quantity=it["quantity"],
                base_qty_deducted=it["base_qty_deducted"],
                unit_cost_snapshot=it["unit_cost_snapshot"],
                unit_sale_price=it["unit_sale_price"],
                line_total=it["line_total"]
            )
            db.add(db_item)
            receipt_items.append({
                "name": it["product_name"],
                "quantity": float(it["quantity"]),
                "unit": it["unit_code"],
                "unit_price": float(it["unit_sale_price"]),
                "line_total": float(it["line_total"])
            })

        # Insert Udhaar entry into khata_ledger
        if udhaar_added > Decimal("0.00") and customer:
            ledger_entry = KhataLedger(
                party_type="customer",
                party_id=customer.id,
                entry_type="credit_sale",
                reference_bill_id=sale.id,
                debit_amount=udhaar_added,
                credit_amount=Decimal("0.00"),
                running_balance=closing_balance,
                promised_due_date=payload.due_date,
                notes=f"POS Bill #{bill_no} (Grand Total: {grand_total}, Cash Paid: {cash_paid})",
                created_at=datetime.utcnow()
            )
            db.add(ledger_entry)

        # Commit ACID transaction
        db.commit()
        db.refresh(sale)

        change_returned = Decimal("0.00")
        if payment_mode == "cash" and cash_paid > grand_total:
            change_returned = cash_paid - grand_total

        return ReceiptResponse(
            bill_no=bill_no,
            store_name="Al-Madina Super Store",
            store_phone="0300-8451299",
            cashier_name=current_user.name,
            sale_date=sale.sale_date,
            customer_name=customer.name if customer else "Walk-in Customer",
            customer_phone=customer.phone if customer else None,
            payment_mode=payment_mode,
            items=receipt_items,
            subtotal=subtotal,
            discount=discount,
            grand_total=grand_total,
            cash_paid=cash_paid,
            change_returned=change_returned,
            current_bill_udhaar=udhaar_added,
            previous_khata_balance=previous_balance,
            closing_khata_balance=closing_balance,
            due_date=payload.due_date
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"POS Checkout transaction failed: {str(e)}"
        )
