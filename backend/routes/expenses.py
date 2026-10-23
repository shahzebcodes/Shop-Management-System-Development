from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.db import get_db
from backend.models import Expense, User
from backend.schemas import ExpenseCreate, ExpenseResponse
from backend.utils.auth_middleware import require_shopkeeper
from backend.utils.unit_converter import round_currency

router = APIRouter(prefix="/api/expenses", tags=["Store Expenses"])

@router.get("", response_model=List[ExpenseResponse])
def get_expenses(
    month: Optional[str] = Query(None, description="Filter by YYYY-MM (e.g. 2026-10)"),
    category: Optional[str] = Query(None, description="Rent | Electricity | Salaries | Maintenance | Other"),
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Retrieve shop operational expenses. Strictly restricted to Shopkeeper role."""
    query = db.query(Expense)

    if category:
        query = query.filter(Expense.category == category)

    if month:
        # e.g., '2026-10'
        query = query.filter(func.date_format(Expense.expense_date, "%Y-%m") == month)

    expenses = query.order_by(Expense.expense_date.desc(), Expense.id.desc()).all()
    return expenses

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Log an operating expense (Rent, Electricity, Salaries, Maintenance, Other). Requires Shopkeeper."""
    valid_categories = ["Rent", "Electricity", "Salaries", "Maintenance", "Other"]
    if payload.category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid expense category. Must be one of: {', '.join(valid_categories)}"
        )

    amount = round_currency(Decimal(str(payload.amount)))
    expense_date = payload.expense_date or date.today()

    expense = Expense(
        category=payload.category,
        title=payload.title.strip(),
        amount=amount,
        expense_date=expense_date,
        user_id=current_user.id,
        notes=payload.notes.strip() if payload.notes else None
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_expense(
    id: int,
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """Delete an expense entry. Requires Shopkeeper."""
    expense = db.query(Expense).filter(Expense.id == id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense entry not found.")

    db.delete(expense)
    db.commit()
    return {"message": f"Expense entry #{id} ('{expense.title}') deleted successfully."}
