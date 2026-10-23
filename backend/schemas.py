from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict

# ============================================================================
# AUTH & USER SCHEMAS
# ============================================================================
class LoginRequest(BaseModel):
    phone: str = Field(..., example="0300-8451299")
    password: str = Field(..., example="admin123")

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    phone: str
    role: str
    is_active: bool
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ============================================================================
# CATEGORY SCHEMAS
# ============================================================================
class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=100)
    color_hex: Optional[str] = Field("#0F766E", max_length=10)
    is_quick_preset: Optional[bool] = False

class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    color_hex: str
    is_quick_preset: bool
    created_at: datetime

# ============================================================================
# UNIT & CONVERSION SCHEMAS
# ============================================================================
class UnitCreate(BaseModel):
    name: str = Field(..., max_length=50)
    short_code: str = Field(..., max_length=10)
    base_unit_id: Optional[int] = None
    conversion_multiplier: Decimal = Field(default=Decimal("1.0000"), max_digits=10, decimal_places=4)

class UnitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    short_code: str
    base_unit_id: Optional[int] = None
    conversion_multiplier: Decimal
    created_at: datetime

class UnitConvertRequest(BaseModel):
    product_id: Optional[int] = None
    source_unit_id: int
    target_unit_id: Optional[int] = None
    quantity: Decimal = Field(..., max_digits=10, decimal_places=3)

class UnitConvertResponse(BaseModel):
    source_unit_id: int
    source_unit_name: str
    quantity: Decimal
    base_unit_id: int
    base_unit_name: str
    converted_base_quantity: Decimal

# ============================================================================
# PRODUCT SCHEMAS
# ============================================================================
class ProductCreate(BaseModel):
    name: str = Field(..., max_length=255)
    category_id: int
    base_unit_id: int
    barcode: str = Field(..., max_length=100)
    purchase_price: Decimal = Field(default=Decimal("0.00"), max_digits=12, decimal_places=2)
    sale_price: Decimal = Field(default=Decimal("0.00"), max_digits=12, decimal_places=2)
    stock_qty: Decimal = Field(default=Decimal("0.000"), max_digits=10, decimal_places=3)
    min_stock_alert: Decimal = Field(default=Decimal("5.000"), max_digits=10, decimal_places=3)
    pieces_per_carton: Decimal = Field(default=Decimal("1.000"), max_digits=10, decimal_places=3)
    is_active: Optional[bool] = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    base_unit_id: Optional[int] = None
    barcode: Optional[str] = None
    purchase_price: Optional[Decimal] = None
    sale_price: Optional[Decimal] = None
    stock_qty: Optional[Decimal] = None
    min_stock_alert: Optional[Decimal] = None
    pieces_per_carton: Optional[Decimal] = None
    is_active: Optional[bool] = None

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    category_id: int
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    base_unit_id: int
    base_unit_name: Optional[str] = None
    base_unit_code: Optional[str] = None
    barcode: str
    purchase_price: Optional[Decimal] = None
    sale_price: Decimal
    profit_margin: Optional[Decimal] = None
    stock_qty: Decimal
    min_stock_alert: Decimal
    pieces_per_carton: Decimal
    is_active: bool
    is_low_stock: bool = False
    updated_at: datetime

# ============================================================================
# SUPPLIER SCHEMAS
# ============================================================================
class SupplierCreate(BaseModel):
    name: str = Field(..., max_length=100)
    company_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    current_balance: Optional[Decimal] = Decimal("0.00")

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class SupplierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    company_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    current_balance: Decimal
    created_at: datetime

class SupplierPayment(BaseModel):
    amount: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    notes: Optional[str] = None

# ============================================================================
# PURCHASES (STOCK-IN) SCHEMAS
# ============================================================================
class PurchaseItemCreate(BaseModel):
    product_id: int
    unit_id: int
    quantity: Decimal = Field(..., gt=0, max_digits=10, decimal_places=3)
    unit_cost: Decimal = Field(..., ge=0, max_digits=12, decimal_places=2)

class PurchaseCreate(BaseModel):
    supplier_id: int
    invoice_no: Optional[str] = None
    items: List[PurchaseItemCreate]
    amount_paid: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=12, decimal_places=2)
    notes: Optional[str] = None

class PurchaseItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    product_name: Optional[str] = None
    unit_id: int
    unit_code: Optional[str] = None
    quantity: Decimal
    base_qty_added: Decimal
    unit_cost: Decimal
    line_total: Decimal

class PurchaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    invoice_no: str
    supplier_id: int
    supplier_name: Optional[str] = None
    total_cost: Decimal
    amount_paid: Decimal
    balance_owed: Decimal
    purchase_date: datetime
    notes: Optional[str] = None
    items: List[PurchaseItemResponse] = []

# ============================================================================
# CUSTOMER (UDHAAR / KHATA) SCHEMAS
# ============================================================================
class CustomerCreate(BaseModel):
    name: str = Field(..., max_length=100)
    phone: str = Field(..., max_length=20)
    address: Optional[str] = None
    current_udhaar_balance: Optional[Decimal] = Decimal("0.00")
    promised_due_date: Optional[date] = None
    credit_limit: Optional[Decimal] = Decimal("50000.00")

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    promised_due_date: Optional[date] = None
    credit_limit: Optional[Decimal] = None

class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    phone: str
    address: Optional[str] = None
    current_udhaar_balance: Decimal
    promised_due_date: Optional[date] = None
    credit_limit: Decimal
    is_overdue: bool = False
    created_at: datetime

class CustomerPaymentReceive(BaseModel):
    amount: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    next_due_date: Optional[date] = None
    notes: Optional[str] = None

# ============================================================================
# POS & SALES SCHEMAS
# ============================================================================
class SaleItemCreate(BaseModel):
    product_id: int
    sold_unit_id: Optional[int] = None
    quantity: Decimal = Field(..., gt=0, max_digits=10, decimal_places=3)
    unit_sale_price: Optional[Decimal] = None

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    items: List[SaleItemCreate]
    discount: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=12, decimal_places=2)
    payment_mode: str = Field(..., example="cash") # 'cash' | 'udhaar' | 'partial'
    cash_paid: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=12, decimal_places=2)
    due_date: Optional[date] = None
    notes: Optional[str] = None

class SaleItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    product_name: Optional[str] = None
    sold_unit_id: int
    unit_code: Optional[str] = None
    quantity: Decimal
    base_qty_deducted: Decimal
    unit_sale_price: Decimal
    line_total: Decimal

class SaleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    bill_no: str
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    subtotal: Decimal
    discount: Decimal
    grand_total: Decimal
    payment_mode: str
    cash_paid: Decimal
    udhaar_added: Decimal
    due_date: Optional[date] = None
    sale_date: datetime
    items: List[SaleItemResponse] = []

class ReceiptResponse(BaseModel):
    bill_no: str
    store_name: str = "Al-Madina Super Store"
    store_phone: str = "0300-8451299"
    cashier_name: str
    sale_date: datetime
    customer_name: Optional[str] = "Walk-in Customer"
    customer_phone: Optional[str] = None
    payment_mode: str
    items: List[dict]
    subtotal: Decimal
    discount: Decimal
    grand_total: Decimal
    cash_paid: Decimal
    change_returned: Decimal = Decimal("0.00")
    current_bill_udhaar: Decimal
    previous_khata_balance: Decimal
    closing_khata_balance: Decimal
    due_date: Optional[date] = None

# ============================================================================
# KHATA LEDGER SCHEMAS
# ============================================================================
class LedgerEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    party_type: str
    party_id: int
    entry_type: str
    reference_bill_id: Optional[int] = None
    debit_amount: Decimal
    credit_amount: Decimal
    running_balance: Decimal
    promised_due_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime

# ============================================================================
# EXPENSE SCHEMAS
# ============================================================================
class ExpenseCreate(BaseModel):
    category: str = Field(..., example="Electricity")
    title: str = Field(..., max_length=255)
    amount: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    expense_date: Optional[date] = None
    notes: Optional[str] = None

class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: str
    title: str
    amount: Decimal
    expense_date: date
    user_id: int
    notes: Optional[str] = None
    created_at: datetime

# ============================================================================
# REPORTS & DASHBOARD SCHEMAS
# ============================================================================
class DashboardMetricsResponse(BaseModel):
    period: str
    total_sales: Decimal
    total_orders: int
    cogs: Decimal
    gross_profit: Decimal
    gross_margin_pct: Decimal
    total_expenses: Decimal
    net_profit: Decimal
    net_margin_pct: Decimal
    total_customer_udhaar: Decimal
    total_supplier_payable: Decimal
    low_stock_count: int

class CategoryReportResponse(BaseModel):
    category_id: int
    category_name: str
    color_hex: str
    items_sold: Decimal
    total_sales: Decimal
    total_cogs: Decimal
    gross_profit: Decimal
    margin_pct: Decimal
