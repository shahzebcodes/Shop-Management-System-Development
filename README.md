# DukaanKhata: Retail POS, Inventory & Digital Udhaar (Khata) System

A production-ready **FastAPI REST API Backend** and **MySQL 8.0 InnoDB Database** engineered for high-velocity retail, grocery stores, and wholesale businesses. Features zero-floating-point numeric precision, barcode scanning, loose decimal unit conversions (kg/gram, liter/ml, dozen, carton), 3-way split billing, weighted average cost accounting, and customer & supplier khata ledgers.

---

## System Architecture

- **Backend Framework**: Python 3.14 / FastAPI (Asynchronous & Synchronous endpoints with auto-generated OpenAPI docs at `/docs`)
- **Database Engine**: MySQL 8.0 with `ENGINE=InnoDB` and `utf8mb4_unicode_ci` (Strict Foreign Key constraints & ACID transactions)
- **ORM & Connection Pool**: SQLAlchemy 2.0 + PyMySQL with connection pooling (`pool_size=10, max_overflow=20, pool_recycle=3600`)
- **Authentication**: JWT (JSON Web Tokens using `PyJWT`) + `bcrypt` salted password hashing
- **Frontend Client**: React 19 + Vite with Axios HTTP Client (`src/api/axiosClient.js`)

---

## Numeric Precision Standards

To prevent floating-point discrepancies:
- **`DECIMAL(10,3)`**: All physical quantities, loose weights, and inventory balances (e.g. `2.500 kg`, `0.250 L`).
- **`DECIMAL(12,2)`**: All financial amounts, prices, expenses, profits, and running balances (e.g. `₨ 2,650.00`).
- **`DECIMAL(10,4)`**: Unit conversion factors (e.g. `1 gram = 0.0010 kg`, `1 dozen = 12.0000 pieces`).

---

## 12-Table MySQL Database Schema (`database/schema.sql`)

1. **`users`**: Store owner (`shopkeeper`) and cashier staff (`staff`) accounts with phone authentication and bcrypt hashes.
2. **`categories`**: Product classifications with visual color tags and quick preset flags.
3. **`units`**: Measurement units supporting recursive base conversions (kg/g, L/ml, doz/pc, carton).
4. **`products`**: Live inventory with barcode uniqueness, purchase/sale pricing, decimal stock, and reorder alerts.
5. **`suppliers`**: Wholesalers/distributors with company credentials and current balance owed.
6. **`purchases`**: Stock-In bills tracking supplier invoices, total cost, amount paid, and balance owed.
7. **`purchase_items`**: Itemized received products with unit conversion and cost tracking.
8. **`customers`**: Udhaar profiles with credit limits, current balances, and promised payment dates.
9. **`sales`**: POS invoices with payment mode (`cash`, `udhaar`, `partial`), discounts, and balance tracking.
10. **`sale_items`**: Sold items with **`unit_cost_snapshot`** (purchase price at exact time of sale for accurate COGS).
11. **`khata_ledger`**: Unified double-entry ledger for customer debts/recoveries and supplier payables.
12. **`expenses`**: Operating store expenses (Rent, Electricity, Salaries, Maintenance, Other).

---

## Role-Based Security & Privacy (`backend/utils/auth_middleware.py`)

- **`shopkeeper` (Admin/Owner)**: Full access to all endpoints including purchase costs, profit margins, supplier debts, expenses, and analytics.
- **`staff` (Cashier/POS)**:
  - Allowed: POS checkout, receipt generation, inventory lookup, customer udhaar records.
  - **Data Stripping**: When `staff` calls `GET /api/products`, `purchase_price` and `profit_margin` are stripped from the response.
  - **Restricted**: Access to `/api/dashboard`, `/api/reports/*`, `/api/expenses/*`, and `/api/suppliers/*` is blocked with **HTTP 403 Forbidden**.

---

## API Endpoints Reference

### 1. Authentication (`/api/auth`)
- `POST /api/auth/login`: Accepts `{ phone, password }`. Returns JWT Bearer token and user object.
- `GET /api/auth/me`: Validates token and returns current user profile.

### 2. Catalog & Live Inventory (`/api`)
- `GET /api/categories`: List all categories.
- `POST /api/categories`: Create category (Shopkeeper only).
- `GET /api/units`: List measurement units and multipliers.
- `POST /api/units/convert`: Convert sub-unit to base-unit quantity.
- `GET /api/products`: Search by barcode or name with `low_stock_only` filter.
- `POST /api/products`: Add product (Shopkeeper only).
- `PUT /api/products/{id}`: Update product info (Shopkeeper only).
- `DELETE /api/products/{id}`: Soft-delete/archive product.
- `GET /api/inventory/low-stock`: Rapid alert lookup for items below threshold.

### 3. Stock-In Purchases (`/api/purchases`)
- `GET /api/purchases`: List purchase orders (Shopkeeper only).
- `POST /api/purchases`: Atomic transaction:
  - Updates stock quantity (`stock_qty += base_qty_added`).
  - Recalculates **Weighted Average Cost**: `((old_stock * old_cost) + (new_qty * new_cost)) / (old_stock + new_qty)`.
  - Increments supplier payable balance and logs ledger entry if balance owed > 0.

### 4. POS Billing & Checkout (`/api/sales`)
- `GET /api/sales`: Historical sales list.
- `GET /api/sales/{id}/receipt`: 80mm thermal receipt payload with previous and closing khata balances.
- `POST /api/sales`: Atomic checkout:
  - Validates stock availability.
  - Deducts inventory (`stock_qty -= base_qty_deducted`).
  - Snapshots `unit_cost_snapshot`.
  - Verifies customer and due date if udhaar added.
  - Updates customer balance and creates ledger entry.

### 5. Digital Khata / Udhaar (`/api/khata`)
- `GET /api/khata/customers?filter=overdue`: Lists customers and flags overdue accounts (`promised_due_date < today`).
- `GET /api/khata/customers/summary`: Total udhaar, overdue count, and customer metrics.
- `POST /api/khata/customers`: Register new customer.
- `GET /api/khata/customers/{id}/statement`: Full chronological ledger statement.
- `POST /api/khata/customers/{id}/receive-payment`: Deduct recovered cash, update next due date, and log recovery.

### 6. Suppliers & Payables (`/api/suppliers`)
- `GET /api/suppliers`: List all suppliers.
- `GET /api/suppliers/{id}/statement`: Supplier ledger history.
- `POST /api/suppliers/{id}/pay`: Atomically pay supplier balance and log debit entry.

### 7. Operating Expenses (`/api/expenses`)
- `GET /api/expenses?month=YYYY-MM&category=`: Filter expenses.
- `POST /api/expenses`: Log expense (Rent, Electricity, Salaries, Maintenance, Other).
- `DELETE /api/expenses/{id}`: Delete expense.

### 8. Financial Reports & Dashboard (`/api/dashboard`, `/api/reports`)
- `GET /api/dashboard?period=today|weekly|monthly|custom`:
  - **Total Sales** = `SUM(sales.grand_total)`
  - **COGS** = `SUM(sale_items.base_qty_deducted * sale_items.unit_cost_snapshot) + SUM(sales.discount)`
  - **Gross Profit** = `Total Sales - COGS`
  - **Total Expenses** = `SUM(expenses.amount)`
  - **Net Profit** = `Gross Profit - Total Expenses`
- `GET /api/reports/category-wise`: Groups sales revenue, snapshot COGS, and gross profit by category.

---

## Quick Start & Execution

### 1. Configure MySQL Database
Make sure MySQL 8.0 is running, then run:
```bash
# Import schema and seed data
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```
*Database name*: `shop_pos_khata_db`

### 2. Configure Environment (`backend/.env`)
Edit `backend/.env` with your MySQL credentials:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=shop_pos_khata_db
```

### 3. Run the Backend API
Double-click `run_backend.bat` or run:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be available at:
👉 **`http://localhost:8000/docs`**

### 4. Run the Unit Test Suite
```bash
python -m unittest backend/tests/test_backend.py
```

### 5. Run the React Frontend
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## Seed Accounts

| Role | Phone | Password |
|---|---|---|
| **Shopkeeper (Admin)** | `0300-8451299` | `admin123` |
| **Staff Cashier** | `0321-4567890` | `staff123` |
