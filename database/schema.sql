-- ============================================================================
-- DukaanKhata: Retail POS, Inventory & Digital Khata (Udhaar) System
-- MySQL 8.0 Database Schema
-- Character Set: utf8mb4, Collation: utf8mb4_unicode_ci
-- Storage Engine: InnoDB (Full ACID & Foreign Key Support)
-- Precision: DECIMAL(10,3) for weights/quantities, DECIMAL(12,2) for currency,
--            DECIMAL(10,4) for unit conversion multipliers
-- ============================================================================

CREATE DATABASE IF NOT EXISTS shop_pos_khata_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shop_pos_khata_db;

-- Disable foreign key checks during recreation
SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS TABLE (Shopkeeper Admin and POS Staff Cashiers)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('shopkeeper', 'staff') NOT NULL DEFAULT 'staff',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_phone (phone),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CATEGORIES TABLE
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color_hex VARCHAR(10) NOT NULL DEFAULT '#0F766E',
    is_quick_preset BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. UNITS TABLE (Unit of measurement with recursive base conversion)
DROP TABLE IF EXISTS units;
CREATE TABLE units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    short_code VARCHAR(10) NOT NULL UNIQUE,
    base_unit_id INT NULL,
    conversion_multiplier DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_units_base_unit
        FOREIGN KEY (base_unit_id) REFERENCES units(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PRODUCTS TABLE (Inventory catalog with barcode, decimal stock, and thresholds)
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    base_unit_id INT NOT NULL,
    barcode VARCHAR(100) NOT NULL UNIQUE,
    purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    sale_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    stock_qty DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    min_stock_alert DECIMAL(10,3) NOT NULL DEFAULT 5.000,
    pieces_per_carton DECIMAL(10,3) NOT NULL DEFAULT 1.000,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_barcode (barcode),
    INDEX idx_products_category (category_id),
    INDEX idx_products_stock (stock_qty),
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_products_base_unit
        FOREIGN KEY (base_unit_id) REFERENCES units(id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SUPPLIERS TABLE (Vendors and wholesalers with balance owed)
DROP TABLE IF EXISTS suppliers;
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150) NULL,
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    current_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_suppliers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PURCHASES TABLE (Stock-In invoices from suppliers)
DROP TABLE IF EXISTS purchases;
CREATE TABLE purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(100) NOT NULL,
    supplier_id INT NOT NULL,
    user_id INT NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    balance_owed DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    purchase_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    INDEX idx_purchases_invoice (invoice_no),
    INDEX idx_purchases_supplier (supplier_id),
    INDEX idx_purchases_date (purchase_date),
    CONSTRAINT fk_purchases_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_purchases_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. PURCHASE_ITEMS TABLE (Itemized products received in a purchase)
DROP TABLE IF EXISTS purchase_items;
CREATE TABLE purchase_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    product_id INT NOT NULL,
    unit_id INT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    base_qty_added DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_purchase_items_purchase
        FOREIGN KEY (purchase_id) REFERENCES purchases(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_purchase_items_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_purchase_items_unit
        FOREIGN KEY (unit_id) REFERENCES units(id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. CUSTOMERS TABLE (Customer Udhaar / Khata profiles and credit limits)
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    address TEXT NULL,
    current_udhaar_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    promised_due_date DATE NULL,
    credit_limit DECIMAL(12,2) NOT NULL DEFAULT 50000.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customers_phone (phone),
    INDEX idx_customers_balance (current_udhaar_balance),
    INDEX idx_customers_due (promised_due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. SALES TABLE (POS checkout bills and payment breakdown)
DROP TABLE IF EXISTS sales;
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_no VARCHAR(100) NOT NULL UNIQUE,
    customer_id INT NULL,
    user_id INT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_mode ENUM('cash', 'udhaar', 'partial') NOT NULL,
    cash_paid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    udhaar_added DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    due_date DATE NULL,
    sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sales_bill_no (bill_no),
    INDEX idx_sales_customer (customer_id),
    INDEX idx_sales_date (sale_date),
    INDEX idx_sales_mode (payment_mode),
    CONSTRAINT fk_sales_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_sales_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. SALE_ITEMS TABLE (Itemized products sold with cost snapshot for accurate COGS)
DROP TABLE IF EXISTS sale_items;
CREATE TABLE sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    sold_unit_id INT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    base_qty_deducted DECIMAL(10,3) NOT NULL,
    unit_cost_snapshot DECIMAL(12,2) NOT NULL,
    unit_sale_price DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_sale_items_sale
        FOREIGN KEY (sale_id) REFERENCES sales(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sale_items_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_sale_items_unit
        FOREIGN KEY (sold_unit_id) REFERENCES units(id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. KHATA_LEDGER TABLE (Unified Customer and Supplier Ledger Statements)
DROP TABLE IF EXISTS khata_ledger;
CREATE TABLE khata_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    party_type ENUM('customer', 'supplier') NOT NULL,
    party_id INT NOT NULL,
    entry_type ENUM('credit_sale', 'cash_recovery', 'purchase_credit', 'supplier_payment') NOT NULL,
    reference_bill_id INT NULL,
    debit_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    credit_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    running_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    promised_due_date DATE NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ledger_party (party_type, party_id),
    INDEX idx_ledger_entry_type (entry_type),
    INDEX idx_ledger_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. EXPENSES TABLE (Operating Expenses: Rent, Bills, Salaries, Maintenance)
DROP TABLE IF EXISTS expenses;
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('Rent', 'Electricity', 'Salaries', 'Maintenance', 'Other') NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    user_id INT NOT NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expenses_date (expense_date),
    INDEX idx_expenses_category (category),
    CONSTRAINT fk_expenses_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
