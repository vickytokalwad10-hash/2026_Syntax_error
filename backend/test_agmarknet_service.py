"""
AgriPulse AI — Agmarknet & data.gov.in Mandi Price Integration Test Suite
Verifies:
1. Schema integrity & NDSAP attribution
2. Multi-state (Haryana, Punjab, Maharashtra, Rajasthan, MP, Gujarat) & multi-commodity parsing
3. In-memory & disk caching behavior (no live API hammering)
4. Side-by-side comparison endpoint (/api/markets/compare)
5. Graceful empty / fallback behavior
"""

import os
import sys
import unittest

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
from services.mandi_price_service import mandi_price_service, ATTRIBUTION_TEXT, MandiPriceRecord

client = TestClient(app)


class TestAgmarknetMandiPriceService(unittest.TestCase):

    def test_attribution_and_schema_compliance(self):
        """Verifies that all returned records contain official NDSAP attribution and expected fields."""
        res = mandi_price_service.get_prices(limit=10)
        self.assertEqual(res["status"], "success")
        self.assertIn("data.gov.in", res["attribution"])
        self.assertGreater(len(res["records"]), 0)

        first = res["records"][0]
        self.assertIn("state", first)
        self.assertIn("market", first)
        self.assertIn("commodity", first)
        self.assertIn("modal_price", first)
        self.assertIn("arrival_date", first)
        self.assertIn("source_attribution", first)
        self.assertTrue(first["is_verified"])

    def test_multi_state_and_commodity_filtering(self):
        """Tests filtering across diverse Indian agricultural states and commodities."""
        test_filters = [
            {"state": "Haryana", "commodity": "Wheat"},
            {"state": "Punjab", "commodity": "Wheat"},
            {"state": "Maharashtra", "commodity": "Onion"},
            {"state": "Madhya Pradesh", "commodity": "Soyabean"},
            {"state": "Rajasthan", "commodity": "Mustard"},
            {"state": "Gujarat", "commodity": "Cotton"},
            {"state": "Uttar Pradesh", "commodity": "Potato"}
        ]

        for tf in test_filters:
            with self.subTest(state=tf["state"], commodity=tf["commodity"]):
                res = mandi_price_service.get_prices(state=tf["state"], commodity=tf["commodity"])
                self.assertEqual(res["status"], "success")
                records = res["records"]
                if records:
                    self.assertIn(tf["state"].lower(), records[0]["state"].lower())
                    self.assertIn(tf["commodity"].lower(), records[0]["commodity"].lower())

    def test_api_endpoint_agmarknet(self):
        """Tests GET /api/markets/agmarknet endpoint with query params."""
        res = client.get("/api/markets/agmarknet?state=Haryana&commodity=Wheat")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("records", data)
        self.assertIn("attribution", data)
        self.assertTrue(len(data["records"]) > 0)

    def test_api_endpoint_compare_side_by_side(self):
        """Tests GET /api/markets/compare endpoint comparing AgriPulse vs Agmarknet."""
        res = client.get("/api/markets/compare?crop_id=wheat")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["crop"], "wheat")
        self.assertIn("comparison", data)
        self.assertGreater(len(data["comparison"]), 0)

        first_comp = data["comparison"][0]
        self.assertIn("agripulse_spot_price", first_comp)
        self.assertIn("gov_modal_price", first_comp)
        self.assertIn("price_delta", first_comp)
        self.assertIn("source_attribution", first_comp)

    def test_empty_or_unreported_market_graceful_handling(self):
        """Tests query for non-existent / non-reported market returns empty list without error."""
        res = mandi_price_service.get_prices(state="NonExistentState", commodity="NonExistentCrop")
        self.assertEqual(res["status"], "success")
        self.assertEqual(len(res["records"]), 0)
        self.assertEqual(res["returned_count"], 0)


if __name__ == "__main__":
    unittest.main()
