from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Date, DateTime, Numeric,
    ForeignKey, Enum, Index
)
from sqlalchemy.orm import relationship
from backend.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("shopkeeper", "staff", name="user_role_enum"), nullable=False, default="staff", index=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    purchases = relationship("Purchase", back_populates="user")
    sales = relationship("Sale", back_populates="user")
    expenses = relationship("Expense", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    color_hex = Column(String(10), nullable=False, default="#0F766E")
    is_quick_preset = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    products = relationship("Product", back_populates="category")

class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    short_code = Column(String(10), unique=True, nullable=False)
    base_unit_id = Column(Integer, ForeignKey("units.id", ondelete="SET NULL"), nullable=True)
    conversion_multiplier = Column(Numeric(10, 4), nullable=False, default=Decimal("1.0000"))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    base_unit = relationship("Unit", remote_side=[id], backref="sub_units")
    products = relationship("Product", back_populates="base_unit")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", onupdate="CASCADE"), nullable=False, index=True)
    base_unit_id = Column(Integer, ForeignKey("units.id", onupdate="CASCADE"), nullable=False)
    barcode = Column(String(100), unique=True, nullable=False, index=True)
    purchase_price = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    sale_price = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    stock_qty = Column(Numeric(10, 3), nullable=False, default=Decimal("0.000"), index=True)
    min_stock_alert = Column(Numeric(10, 3), nullable=False, default=Decimal("5.000"))
    pieces_per_carton = Column(Numeric(10, 3), nullable=False, default=Decimal("1.000"))
    is_active = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    category = relationship("Category", back_populates="products")
    base_unit = relationship("Unit", back_populates="products")
    purchase_items = relationship("PurchaseItem", back_populates="product")
    sale_items = relationship("SaleItem", back_populates="product")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    company_name = Column(String(150), nullable=True)
    phone = Column(String(20), nullable=True, index=True)
    address = Column(Text, nullable=True)
    current_balance = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    purchases = relationship("Purchase", back_populates="supplier")

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_no = Column(String(100), nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", onupdate="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", onupdate="CASCADE"), nullable=False)
    total_cost = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    amount_paid = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    balance_owed = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    purchase_date = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    notes = Column(Text, nullable=True)

    supplier = relationship("Supplier", back_populates="purchases")
    user = relationship("User", back_populates="purchases")
    items = relationship("PurchaseItem", back_populates="purchase", cascade="all, delete-orphan")

class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", onupdate="CASCADE"), nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id", onupdate="CASCADE"), nullable=False)
    quantity = Column(Numeric(10, 3), nullable=False)
    base_qty_added = Column(Numeric(10, 3), nullable=False)
    unit_cost = Column(Numeric(12, 2), nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)

    purchase = relationship("Purchase", back_populates="items")
    product = relationship("Product", back_populates="purchase_items")
    unit = relationship("Unit")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    address = Column(Text, nullable=True)
    current_udhaar_balance = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"), index=True)
    promised_due_date = Column(Date, nullable=True, index=True)
    credit_limit = Column(Numeric(12, 2), nullable=False, default=Decimal("50000.00"))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    sales = relationship("Sale", back_populates="customer")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bill_no = Column(String(100), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", onupdate="CASCADE"), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    discount = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    grand_total = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    payment_mode = Column(Enum("cash", "udhaar", "partial", name="payment_mode_enum"), nullable=False, index=True)
    cash_paid = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    udhaar_added = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    due_date = Column(Date, nullable=True)
    sale_date = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    customer = relationship("Customer", back_populates="sales")
    user = relationship("User", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sale_id = Column(Integer, ForeignKey("sales.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", onupdate="CASCADE"), nullable=False)
    sold_unit_id = Column(Integer, ForeignKey("units.id", onupdate="CASCADE"), nullable=False)
    quantity = Column(Numeric(10, 3), nullable=False)
    base_qty_deducted = Column(Numeric(10, 3), nullable=False)
    unit_cost_snapshot = Column(Numeric(12, 2), nullable=False)
    unit_sale_price = Column(Numeric(12, 2), nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)

    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")
    sold_unit = relationship("Unit")

class KhataLedger(Base):
    __tablename__ = "khata_ledger"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    party_type = Column(Enum("customer", "supplier", name="ledger_party_type_enum"), nullable=False)
    party_id = Column(Integer, nullable=False)
    entry_type = Column(
        Enum("credit_sale", "cash_recovery", "purchase_credit", "supplier_payment", name="ledger_entry_type_enum"),
        nullable=False,
        index=True
    )
    reference_bill_id = Column(Integer, nullable=True)
    debit_amount = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    credit_amount = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    running_balance = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    promised_due_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    __table_args__ = (
        Index("idx_ledger_party", "party_type", "party_id"),
    )

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(
        Enum("Rent", "Electricity", "Salaries", "Maintenance", "Other", name="expense_category_enum"),
        nullable=False,
        index=True
    )
    title = Column(String(255), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    expense_date = Column(Date, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", onupdate="CASCADE"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="expenses")
