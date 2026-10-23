from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from backend.db import get_db
from backend.models import (
    Sale, SaleItem, Expense, Product, Category, Customer, Supplier, User
)
from backend.schemas import DashboardMetricsResponse, CategoryReportResponse
from backend.utils.auth_middleware import require_shopkeeper
from backend.utils.unit_converter import round_currency

router = APIRouter(prefix="/api", tags=["Dashboard & Profit Analytics"])

def parse_date_window(
    range_type: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Calculate date boundaries based on requested period."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    if range_type == "today":
        return today_start, today_end
    elif range_type == "weekly":
        start = today_start - timedelta(days=7)
        return start, today_end
    elif range_type == "monthly":
        start = today_start - timedelta(days=30)
        return start, today_end
    elif range_type == "custom" and start_date and end_date:
        start = datetime.combine(start_date, datetime.min.time())
        end = datetime.combine(end_date, datetime.max.time())
        return start, end
    else:
        # Default to today
        return today_start, today_end

@router.get("/dashboard", response_model=DashboardMetricsResponse)
@router.get("/reports/summary", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(
    period: str = Query("today", description="'today' | 'weekly' | 'monthly' | 'custom'"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """
    Compute exact financial metrics:
      - Total Sales = SUM(sales.grand_total)
      - Cost of Goods Sold (COGS) = SUM(sale_items.base_qty_deducted * sale_items.unit_cost_snapshot) + SUM(sales.discount)
      - Gross Profit = Total Sales - COGS
      - Total Expenses = SUM(expenses.amount)
      - Net Profit = Gross Profit - Total Expenses
    Strictly protected by require_shopkeeper.
    """
    dt_start, dt_end = parse_date_window(period, start_date, end_date)
    date_start_only = dt_start.date()
    date_end_only = dt_end.date()

    # 1. Total Sales & Total Orders
    sales_agg = db.query(
        func.coalesce(func.sum(Sale.grand_total), 0),
        func.coalesce(func.sum(Sale.discount), 0),
        func.count(Sale.id)
    ).filter(
        Sale.sale_date >= dt_start,
        Sale.sale_date <= dt_end
    ).first()

    total_sales = round_currency(Decimal(str(sales_agg[0])))
    total_discounts = round_currency(Decimal(str(sales_agg[1])))
    total_orders = int(sales_agg[2])

    # 2. Cost of Goods Sold (COGS) based on exact unit cost snapshot at time of sale
    cogs_query = db.query(
        func.coalesce(
            func.sum(SaleItem.base_qty_deducted * SaleItem.unit_cost_snapshot),
            0
        )
    ).join(Sale, SaleItem.sale_id == Sale.id).filter(
        Sale.sale_date >= dt_start,
        Sale.sale_date <= dt_end
    ).scalar()

    base_cogs = round_currency(Decimal(str(cogs_query)))
    # Total COGS includes discounts given on sales
    cogs = round_currency(base_cogs + total_discounts)

    # 3. Gross Profit
    gross_profit = round_currency(total_sales - cogs)
    gross_margin_pct = Decimal("0.00")
    if total_sales > Decimal("0.00"):
        gross_margin_pct = round_currency((gross_profit / total_sales) * Decimal("100.00"))

    # 4. Total Operating Expenses in window
    expenses_query = db.query(
        func.coalesce(func.sum(Expense.amount), 0)
    ).filter(
        Expense.expense_date >= date_start_only,
        Expense.expense_date <= date_end_only
    ).scalar()

    total_expenses = round_currency(Decimal(str(expenses_query)))

    # 5. Net Profit
    net_profit = round_currency(gross_profit - total_expenses)
    net_margin_pct = Decimal("0.00")
    if total_sales > Decimal("0.00"):
        net_margin_pct = round_currency((net_profit / total_sales) * Decimal("100.00"))

    # 6. Global Shop Balances
    total_customer_udhaar = round_currency(
        Decimal(str(db.query(func.coalesce(func.sum(Customer.current_udhaar_balance), 0)).scalar()))
    )
    total_supplier_payable = round_currency(
        Decimal(str(db.query(func.coalesce(func.sum(Supplier.current_balance), 0)).scalar()))
    )
    low_stock_count = db.query(Product).filter(
        Product.is_active == True,
        Product.stock_qty <= Product.min_stock_alert
    ).count()

    return DashboardMetricsResponse(
        period=period,
        total_sales=total_sales,
        total_orders=total_orders,
        cogs=cogs,
        gross_profit=gross_profit,
        gross_margin_pct=gross_margin_pct,
        total_expenses=total_expenses,
        net_profit=net_profit,
        net_margin_pct=net_margin_pct,
        total_customer_udhaar=total_customer_udhaar,
        total_supplier_payable=total_supplier_payable,
        low_stock_count=low_stock_count
    )

@router.get("/reports/category-wise", response_model=List[CategoryReportResponse])
def get_category_wise_report(
    period: str = Query("monthly", description="'today' | 'weekly' | 'monthly' | 'custom'"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(require_shopkeeper),
    db: Session = Depends(get_db)
):
    """
    Category-wise sales and gross profit breakdown.
    Groups sales revenue and snapshot COGS by categories.name. Requires Shopkeeper role.
    """
    dt_start, dt_end = parse_date_window(period, start_date, end_date)

    categories = db.query(Category).all()
    report = []

    for cat in categories:
        # Aggregated stats for products under this category
        stats = db.query(
            func.coalesce(func.sum(SaleItem.quantity), 0),
            func.coalesce(func.sum(SaleItem.line_total), 0),
            func.coalesce(func.sum(SaleItem.base_qty_deducted * SaleItem.unit_cost_snapshot), 0)
        ).join(
            Sale, SaleItem.sale_id == Sale.id
        ).join(
            Product, SaleItem.product_id == Product.id
        ).filter(
            Product.category_id == cat.id,
            Sale.sale_date >= dt_start,
            Sale.sale_date <= dt_end
        ).first()

        qty_sold = Decimal(str(stats[0]))
        sales_val = round_currency(Decimal(str(stats[1])))
        cogs_val = round_currency(Decimal(str(stats[2])))
        gross_val = round_currency(sales_val - cogs_val)
        
        margin_pct = Decimal("0.00")
        if sales_val > Decimal("0.00"):
            margin_pct = round_currency((gross_val / sales_val) * Decimal("100.00"))

        report.append(
            CategoryReportResponse(
                category_id=cat.id,
                category_name=cat.name,
                color_hex=cat.color_hex,
                items_sold=qty_sold,
                total_sales=sales_val,
                total_cogs=cogs_val,
                gross_profit=gross_val,
                margin_pct=margin_pct
            )
        )

    # Sort descending by total sales
    report.sort(key=lambda x: x.total_sales, reverse=True)
    return report
