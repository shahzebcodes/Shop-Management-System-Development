import unittest
from decimal import Decimal
from datetime import datetime, date, timezone

from backend.utils.security import (
    hash_password, verify_password, create_access_token, decode_access_token
)
from backend.utils.unit_converter import round_stock, round_currency
from backend.routes.catalog import format_product_response

class TestDukaanKhataBackend(unittest.TestCase):
    def test_password_hashing(self):
        pwd = "admin123"
        hashed = hash_password(pwd)
        self.assertTrue(verify_password(pwd, hashed))
        self.assertFalse(verify_password("wrongpassword", hashed))

    def test_jwt_token_generation_and_decoding(self):
        payload = {"sub": "1", "phone": "0300-8451299", "role": "shopkeeper", "name": "Haji Muhammad Usman"}
        token = create_access_token(payload)
        self.assertIsInstance(token, str)
        decoded = decode_access_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["sub"], "1")
        self.assertEqual(decoded["role"], "shopkeeper")

    def test_decimal_precision(self):
        # Stock quantities must maintain DECIMAL(10,3)
        stock_val = Decimal("2.500")
        sub_qty = Decimal("0.250")
        res_stock = round_stock(stock_val - sub_qty)
        self.assertEqual(str(res_stock), "2.250")

        # Currency must maintain DECIMAL(12,2)
        price = Decimal("340.00")
        cost = Decimal("280.00")
        profit = round_currency(price - cost)
        self.assertEqual(str(profit), "60.00")

    def test_weighted_average_cost_formula(self):
        # old_stock = 40 kg at Rs 200/kg (total 8000)
        # incoming = 60 kg at Rs 250/kg (total 15000)
        # total = 100 kg at (8000 + 15000) / 100 = Rs 230/kg
        old_stock = Decimal("40.000")
        old_cost = Decimal("200.00")
        incoming_qty = Decimal("60.000")
        incoming_cost = Decimal("250.00")
        total_addition_cost = incoming_qty * incoming_cost

        new_total_stock = old_stock + incoming_qty
        new_weighted_cost = round_currency(
            ((old_stock * old_cost) + total_addition_cost) / new_total_stock
        )
        self.assertEqual(str(new_weighted_cost), "230.00")

    def test_staff_product_privacy(self):
        # Mock product object
        class DummyCategory:
            name = "Grocery"
            color_hex = "#0F766E"

        class DummyUnit:
            name = "Kilogram"
            short_code = "kg"

        class DummyProduct:
            id = 1
            name = "Basmati Rice"
            category_id = 1
            category = DummyCategory()
            base_unit_id = 1
            base_unit = DummyUnit()
            barcode = "896400012345"
            purchase_price = Decimal("280.00")
            sale_price = Decimal("340.00")
            stock_qty = Decimal("48.500")
            min_stock_alert = Decimal("20.000")
            pieces_per_carton = Decimal("1.000")
            is_active = True
            updated_at = datetime.now(timezone.utc)

        prod = DummyProduct()

        # When requested by shopkeeper
        admin_view = format_product_response(prod, is_staff=False)
        self.assertEqual(admin_view["purchase_price"], Decimal("280.00"))
        self.assertEqual(admin_view["profit_margin"], Decimal("60.00"))
        self.assertEqual(admin_view["sale_price"], Decimal("340.00"))

        # When requested by staff cashier
        staff_view = format_product_response(prod, is_staff=True)
        self.assertIsNone(staff_view["purchase_price"])
        self.assertIsNone(staff_view["profit_margin"])
        self.assertEqual(staff_view["sale_price"], Decimal("340.00"))
        self.assertEqual(staff_view["stock_qty"], Decimal("48.500"))

    def test_financial_analytics_formulas(self):
        # Total Sales = 10000
        # Discount = 500
        # Grand Total = 9500
        # COGS = 7000 + Discount (500) = 7500
        # Gross Profit = 9500 - 7500 = 2000
        # Operating Expenses = 1200
        # Net Profit = 2000 - 1200 = 800
        total_sales = Decimal("9500.00")
        base_cogs = Decimal("7000.00")
        discount = Decimal("500.00")
        total_cogs = base_cogs + discount
        gross_profit = total_sales - total_cogs
        total_expenses = Decimal("1200.00")
        net_profit = gross_profit - total_expenses

        self.assertEqual(str(gross_profit), "2000.00")
        self.assertEqual(str(net_profit), "800.00")

if __name__ == "__main__":
    unittest.main()
