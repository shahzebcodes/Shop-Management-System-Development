-- ============================================================================
-- DukaanKhata: Retail POS & Digital Khata System Seed Data
-- ============================================================================

USE shop_pos_khata_db;

-- 1. USERS SEED DATA
-- Passwords:
-- 'admin123' -> $2b$12$K1rSdfi6O7lGZfZhA7yEtuF5xI17M1Qf/U8xH1G0X4y8t5xG1w2pS
-- 'staff123' -> $2b$12$1n8Nl9S8R8kX4z3qW4qO6eP6bI23K5X7/T2mU4G5X7y9t6wH2x3qK
-- Also supports phone matching frontend demo logins: '0300-8451299' & '0321-4567890'
INSERT INTO users (id, name, phone, password_hash, role, is_active) VALUES
(1, 'Haji Muhammad Usman', '0300-8451299', '$2b$12$V7rJjFkKxM3b5hC8uN5aJe1F9.O9kYfR5jJd7qK9n0tG1k8p3fX2m', 'shopkeeper', 1),
(2, 'Hamza Farooq', '0321-4567890', '$2b$12$V7rJjFkKxM3b5hC8uN5aJe1F9.O9kYfR5jJd7qK9n0tG1k8p3fX2m', 'staff', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. CATEGORIES SEED DATA
INSERT INTO categories (id, name, color_hex, is_quick_preset) VALUES
(1, 'Grocery', '#0F766E', 1),
(2, 'Dairy', '#2563EB', 1),
(3, 'Cosmetics', '#EC4899', 1),
(4, 'Bakery', '#EA580C', 1),
(5, 'Beverages', '#7C3AED', 1),
(6, 'Snacks', '#DB2777', 1),
(7, 'Household', '#059669', 1)
ON DUPLICATE KEY UPDATE color_hex=VALUES(color_hex), is_quick_preset=VALUES(is_quick_preset);

-- 3. UNITS SEED DATA
-- Base units have base_unit_id = NULL and multiplier = 1.0000
-- Sub-units point to base_unit_id with exact decimal conversion multiplier
INSERT INTO units (id, name, short_code, base_unit_id, conversion_multiplier) VALUES
(1, 'Kilogram', 'kg', NULL, 1.0000),
(2, 'Gram', 'g', 1, 0.0010),
(3, 'Litre', 'L', NULL, 1.0000),
(4, 'Millilitre', 'ml', 3, 0.0010),
(5, 'Piece', 'pc', NULL, 1.0000),
(6, 'Dozen', 'doz', 5, 12.0000),
(7, 'Packet', 'pkt', 5, 1.0000),
(8, 'Carton', 'ctn', 5, 24.0000)
ON DUPLICATE KEY UPDATE conversion_multiplier=VALUES(conversion_multiplier);

-- 4. PRODUCTS SEED DATA
INSERT INTO products (id, name, category_id, base_unit_id, barcode, purchase_price, sale_price, stock_qty, min_stock_alert, pieces_per_carton, is_active) VALUES
(1, 'Basmati Rice Super Kernel', 1, 1, '896400012345', 280.00, 340.00, 48.500, 20.000, 1.000, 1),
(2, 'Nestle Milkpak 1L', 2, 3, '896400023456', 245.00, 290.00, 24.000, 10.000, 12.000, 1),
(3, 'Dal Chana Special Unpolished', 1, 1, '896400034567', 210.00, 260.00, 35.000, 15.000, 1.000, 1),
(4, 'Dalda Cooking Oil 5L Can', 1, 5, '896400045678', 2250.00, 2650.00, 12.000, 5.000, 4.000, 1),
(5, 'Tapal Danedar Tea 450g', 5, 7, '896400056789', 540.00, 620.00, 18.000, 8.000, 24.000, 1),
(6, 'Rooh Afza Sharbat 800ml', 5, 5, '896400067890', 380.00, 440.00, 5.000, 10.000, 12.000, 1),
(7, 'Dawn Fortified Sandwich Bread Large', 4, 5, '896400078901', 130.00, 160.00, 15.000, 6.000, 1.000, 1),
(8, 'Lux Rose Velvet Beauty Soap 140g', 3, 5, '896400089012', 110.00, 140.00, 32.000, 12.000, 36.000, 1),
(9, 'Ariel Complete Detergent Powder 1kg', 7, 7, '896400090123', 490.00, 570.00, 16.000, 8.000, 12.000, 1),
(10, 'Lays Classic Salted Potato Chips 40g', 6, 7, '896400099999', 42.00, 50.00, 40.000, 15.000, 48.000, 1)
ON DUPLICATE KEY UPDATE sale_price=VALUES(sale_price), stock_qty=VALUES(stock_qty);

-- 5. SUPPLIERS SEED DATA
INSERT INTO suppliers (id, name, company_name, phone, address, current_balance) VALUES
(1, 'Haji Abdul Rasheed', 'Rasheed Brothers Grain Wholesalers', '0301-7788990', 'Shop 14, Ghalla Mandi, Lahore', 45000.00),
(2, 'Muhammad Tariq', 'Al-Rehman Dairy & Beverage Distributors', '0322-9988776', 'Plot 88, Industrial Area, Multan Road', 28500.00),
(3, 'Sheikh Noman', 'Noman FMCG General Wholesale', '0333-5566778', 'Circular Road, Urdu Bazar Market', 15200.00)
ON DUPLICATE KEY UPDATE company_name=VALUES(company_name);

-- 6. CUSTOMERS (KHATA PROFILES) SEED DATA
INSERT INTO customers (id, name, phone, address, current_udhaar_balance, promised_due_date, credit_limit) VALUES
(1, 'Chaudhry Tariq Mehmood', '0302-1234567', 'House 42, St 5, Gulshan Colony', 14500.00, DATE_ADD(CURDATE(), INTERVAL 5 DAY), 50000.00),
(2, 'Malik Shaukat Ali', '0334-9876543', 'Main Bazar, Near Central Mosque', 32000.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 60000.00),
(3, 'Master Muhammad Zubair (School Teacher)', '0313-5544332', 'Teachers Colony, Block B', 4200.00, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 25000.00),
(4, 'Rana Jahangir', '0308-7766554', 'Farmhouse 11, Canal Bank Road', 0.00, NULL, 40000.00)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 7. INITIAL KHATA LEDGER STATEMENTS
INSERT INTO khata_ledger (party_type, party_id, entry_type, reference_bill_id, debit_amount, credit_amount, running_balance, promised_due_date, notes, created_at) VALUES
('customer', 1, 'credit_sale', 101, 14500.00, 0.00, 14500.00, DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Grocery items on udhaar bill #INV-20261015-001', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('customer', 2, 'credit_sale', 102, 35000.00, 0.00, 35000.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Monthly ration supplies', DATE_SUB(NOW(), INTERVAL 12 DAY)),
('customer', 2, 'cash_recovery', NULL, 0.00, 3000.00, 32000.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Partial cash payment received at counter', DATE_SUB(NOW(), INTERVAL 4 DAY)),
('customer', 3, 'credit_sale', 103, 4200.00, 0.00, 4200.00, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'Cooking oil and tea bags udhaar bill', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('supplier', 1, 'purchase_credit', 201, 0.00, 45000.00, 45000.00, DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'Stock-in 10 bags Basmati Rice bill #PO-9812', DATE_SUB(NOW(), INTERVAL 6 DAY)),
('supplier', 2, 'purchase_credit', 202, 0.00, 28500.00, 28500.00, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Milkpak and juices supplies bill #PO-9819', DATE_SUB(NOW(), INTERVAL 3 DAY))
ON DUPLICATE KEY UPDATE notes=VALUES(notes);

-- 8. INITIAL EXPENSES SEED DATA
INSERT INTO expenses (category, title, amount, expense_date, user_id, notes) VALUES
('Rent', 'Shop Monthly Commercial Rent', 35000.00, DATE_FORMAT(CURDATE(), '%Y-%m-01'), 1, 'Main shop premises rent paid in full'),
('Electricity', 'LESCO Commercial Meter Electricity Bill', 14200.00, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 1, 'Monthly shop power bill paid online'),
('Salaries', 'POS Assistant Staff Weekly Stipend', 6000.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 'Cashier advance payment'),
('Maintenance', 'Counter Light and Barcode Scanner Cable Repair', 1850.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1, 'Hardware electrician repair'),
('Other', 'Tea, Snacks & Guest Refreshments', 1250.00, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 'Daily shop hospitality expenses');
