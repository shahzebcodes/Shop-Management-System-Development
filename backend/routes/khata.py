from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.db import get_db
from backend.models import Customer, KhataLedger, User, Sale
from backend.schemas import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    CustomerPaymentReceive, LedgerEntryResponse
)
from backend.utils.auth_middleware import get_current_user
from backend.utils.unit_converter import round_currency

router = APIRouter(prefix="/api/khata", tags=["Digital Khata (Udhaar)"])

def format_customer_response(customer: Customer) -> CustomerResponse:
    balance = Decimal(str(customer.current_udhaar_balance))
    is_overdue = False
    if customer.promised_due_date and balance > Decimal("0.00"):
        is_overdue = (customer.promised_due_date < date.today())

    return CustomerResponse(
        id=customer.id,
        name=customer.name,
        phone=customer.phone,
        address=customer.address,
        current_udhaar_balance=balance,
        promised_due_date=customer.promised_due_date,
        credit_limit=Decimal(str(customer.credit_limit)),
        is_overdue=is_overdue,
        created_at=customer.created_at
    )

@router.get("/customers", response_model=List[CustomerResponse])
def get_customers(
    filter: Optional[str] = Query(None, description="'overdue' | 'active_debt' | None"),
    search: Optional[str] = Query(None, description="Search by customer name or phone"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve customer Khata profiles.
    Supports filtering by overdue promises (promised_due_date < today) or active debt.
    """
    query = db.query(Customer)

    if search:
        search_clean = search.strip()
        query = query.filter(
            (Customer.name.ilike(f"%{search_clean}%")) | (Customer.phone.ilike(f"%{search_clean}%"))
        )

    if filter == "overdue":
        query = query.filter(
            Customer.current_udhaar_balance > 0,
            Customer.promised_due_date != None,
            Customer.promised_due_date < date.today()
        )
    elif filter == "active_debt":
        query = query.filter(Customer.current_udhaar_balance > 0)

    customers = query.order_by(Customer.current_udhaar_balance.desc()).all()
    return [format_customer_response(c) for c in customers]

@router.get("/customers/summary")
def get_khata_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Quick summary cards for Khata management: total udhaar, overdue count, and customer totals."""
    total_udhaar = db.query(func.coalesce(func.sum(Customer.current_udhaar_balance), 0)).scalar()
    overdue_query = db.query(
        func.count(Customer.id),
        func.coalesce(func.sum(Customer.current_udhaar_balance), 0)
    ).filter(
        Customer.current_udhaar_balance > 0,
        Customer.promised_due_date != None,
        Customer.promised_due_date < date.today()
    ).first()

    return {
        "total_udhaar_balance": Decimal(str(total_udhaar)),
        "overdue_customers_count": overdue_query[0] if overdue_query else 0,
        "overdue_amount": Decimal(str(overdue_query[1])) if overdue_query else Decimal("0.00"),
        "total_customers_count": db.query(Customer).count()
    }

@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register a new customer Khata profile."""
    existing = db.query(Customer).filter(Customer.phone == payload.phone.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with phone '{payload.phone}' already exists ({existing.name})."
        )

    customer = Customer(
        name=payload.name.strip(),
        phone=payload.phone.strip(),
        address=payload.address.strip() if payload.address else None,
        current_udhaar_balance=round_currency(payload.current_udhaar_balance or Decimal("0.00")),
        promised_due_date=payload.promised_due_date,
        credit_limit=round_currency(payload.credit_limit or Decimal("50000.00"))
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return format_customer_response(customer)

@router.get("/customers/{id}", response_model=CustomerResponse)
def get_customer_by_id(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve details for a single customer Khata account."""
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return format_customer_response(customer)

@router.put("/customers/{id}", response_model=CustomerResponse)
def update_customer(
    id: int,
    payload: CustomerUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update customer details, credit limit, or promised due date."""
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    if payload.name is not None:
        customer.name = payload.name.strip()
    if payload.phone is not None:
        customer.phone = payload.phone.strip()
    if payload.address is not None:
        customer.address = payload.address.strip()
    if payload.promised_due_date is not None:
        customer.promised_due_date = payload.promised_due_date
    if payload.credit_limit is not None:
        customer.credit_limit = round_currency(payload.credit_limit)

    db.commit()
    db.refresh(customer)
    return format_customer_response(customer)

@router.get("/customers/{id}/statement", response_model=List[LedgerEntryResponse])
def get_customer_statement(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full chronological Khata statement for this customer."""
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    entries = (
        db.query(KhataLedger)
        .filter(KhataLedger.party_type == "customer", KhataLedger.party_id == id)
        .order_by(KhataLedger.created_at.desc(), KhataLedger.id.desc())
        .all()
    )
    return entries

@router.post("/customers/{id}/receive-payment", status_code=status.HTTP_200_OK)
def receive_customer_payment(
    id: int,
    payload: CustomerPaymentReceive,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atomically receive customer cash recovery:
      1. Deduct amount from customer.current_udhaar_balance.
      2. If remaining balance > 0 and next_due_date provided, update promised_due_date.
      3. Insert 'cash_recovery' row into khata_ledger with running_balance.
      4. Commit ACID transaction.
    """
    customer = db.query(Customer).filter(Customer.id == id).with_for_update().first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    amount = round_currency(Decimal(str(payload.amount)))
    if amount <= Decimal("0.00"):
        raise HTTPException(status_code=400, detail="Recovery amount must be greater than zero.")

    try:
        old_balance = Decimal(str(customer.current_udhaar_balance))
        new_balance = round_currency(max(Decimal("0.00"), old_balance - amount))
        customer.current_udhaar_balance = new_balance

        if payload.next_due_date:
            customer.promised_due_date = payload.next_due_date
        elif new_balance == Decimal("0.00"):
            customer.promised_due_date = None

        ledger_entry = KhataLedger(
            party_type="customer",
            party_id=customer.id,
            entry_type="cash_recovery",
            reference_bill_id=None,
            debit_amount=Decimal("0.00"),
            credit_amount=amount,
            running_balance=new_balance,
            promised_due_date=customer.promised_due_date,
            notes=payload.notes or f"Cash payment of Rs {amount} received by {current_user.name}",
            created_at=datetime.utcnow()
        )
        db.add(ledger_entry)

        db.commit()
        db.refresh(customer)

        return {
            "message": f"Successfully received payment of Rs {amount} from {customer.name}.",
            "customer_id": customer.id,
            "amount_received": amount,
            "previous_balance": old_balance,
            "closing_balance": new_balance,
            "next_due_date": customer.promised_due_date
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record customer payment: {str(e)}")
