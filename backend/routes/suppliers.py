from datetime import datetime
from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.models import Supplier, KhataLedger, User
from backend.schemas import (
    SupplierCreate, SupplierUpdate, SupplierResponse,
    SupplierPayment, LedgerEntryResponse
)
from backend.utils.auth_middleware import require_shopkeeper
from backend.utils.unit_converter import round_currency

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers & Payables"])

@router.get("", response_model=List[SupplierResponse])
def get_suppliers(
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Retrieve all suppliers and payable balances. Strictly restricted to Shopkeeper."""
    return db.query(Supplier).order_by(Supplier.name.asc()).all()

@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(
    payload: SupplierCreate,
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Register a new supplier / vendor. Requires Shopkeeper."""
    supplier = Supplier(
        name=payload.name.strip(),
        company_name=payload.company_name.strip() if payload.company_name else None,
        phone=payload.phone.strip() if payload.phone else None,
        address=payload.address.strip() if payload.address else None,
        current_balance=round_currency(payload.current_balance or Decimal("0.00"))
    )
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

@router.get("/{id}", response_model=SupplierResponse)
def get_supplier_by_id(
    id: int,
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Retrieve details for a single supplier."""
    supplier = db.query(Supplier).filter(Supplier.id == id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")
    return supplier

@router.put("/{id}", response_model=SupplierResponse)
def update_supplier(
    id: int,
    payload: SupplierUpdate,
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Update supplier contact and business information."""
    supplier = db.query(Supplier).filter(Supplier.id == id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    if payload.name is not None:
        supplier.name = payload.name.strip()
    if payload.company_name is not None:
        supplier.company_name = payload.company_name.strip()
    if payload.phone is not None:
        supplier.phone = payload.phone.strip()
    if payload.address is not None:
        supplier.address = payload.address.strip()

    db.commit()
    db.refresh(supplier)
    return supplier

@router.get("/{id}/statement", response_model=List[LedgerEntryResponse])
def get_supplier_statement(
    id: int,
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Retrieve full chronological ledger statement for this supplier."""
    supplier = db.query(Supplier).filter(Supplier.id == id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    entries = (
        db.query(KhataLedger)
        .filter(KhataLedger.party_type == "supplier", KhataLedger.party_id == id)
        .order_by(KhataLedger.created_at.desc(), KhataLedger.id.desc())
        .all()
    )
    return entries

@router.post("/{id}/pay", status_code=status.HTTP_200_OK)
def pay_supplier(
    id: int,
    payload: SupplierPayment,
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """
    Atomically execute a supplier cash payment transaction:
      1. Deduct amount from supplier.current_balance.
      2. Record a 'supplier_payment' debit row in khata_ledger with updated running_balance.
      3. Commit ACID transaction.
    """
    supplier = db.query(Supplier).filter(Supplier.id == id).with_for_update().first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    pay_amount = round_currency(Decimal(str(payload.amount)))
    if pay_amount <= Decimal("0.00"):
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero.")

    try:
        new_balance = round_currency(Decimal(str(supplier.current_balance)) - pay_amount)
        supplier.current_balance = new_balance

        ledger_entry = KhataLedger(
            party_type="supplier",
            party_id=supplier.id,
            entry_type="supplier_payment",
            debit_amount=pay_amount,
            credit_amount=Decimal("0.00"),
            running_balance=new_balance,
            notes=payload.notes or f"Cash payment of Rs {pay_amount} to {supplier.name}",
            created_at=datetime.utcnow()
        )
        db.add(ledger_entry)

        db.commit()
        db.refresh(supplier)

        return {
            "message": f"Successfully paid Rs {pay_amount} to {supplier.name}.",
            "supplier_id": supplier.id,
            "amount_paid": pay_amount,
            "closing_balance": supplier.current_balance
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record supplier payment: {str(e)}")
