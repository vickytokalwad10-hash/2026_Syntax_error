"""
AgriPulse AI — Multi-Source (Agmarknet & e-NAM) Mandi Price Test Suite
Verifies:
1. Multi-source schema integrity & NDSAP attributions for both Agmarknet and e-NAM
2. Source filtering (all, agmarknet, enam)
3. Dynamic reporting coverage evaluation (no hardcoded totals)
4. 3-Way side-by-side comparison endpoint (/api/markets/compare)
5. Multi-state and multi-commodity queries across India
"""

import os
import sys
import unittest

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
from services.mandi_price_service import (
    mandi_price_service,
    AGMARKNET_ATTRIBUTION,
    ENAM_ATTRIBUTION,
    MandiPriceRecord
)

client = TestClient(app)


class TestMultiSourceMandiPriceService(unittest.TestCase):

    def test_multi_source_attribution_and_schema(self):
        """Verifies both Agmarknet and e-NAM records contain correct attributions and schema fields."""
        res_all = mandi_price_service.get_prices(source="all", limit=20)
        self.assertEqual(res_all["status"], "success")
        self.assertIn("attribution", res_all)
        self.assertIn("agmarknet", res_all["attribution"])
        self.assertIn("enam", res_all["attribution"])
        self.assertGreater(res_all["total_mandis_reporting"], 0)

        # Verify dynamic coverage string
        self.assertIn("mandis reporting", res_all["coverage_summary"])

    def test_source_filtering_enam_and_agmarknet(self):
        """Verifies source filtering returns records specifically for Agmarknet or e-NAM."""
        res_enam = mandi_price_service.get_prices(source="enam", limit=10)
        self.assertEqual(res_enam["status"], "success")
        for rec in res_enam["records"]:
            self.assertEqual(rec["source"], "enam")
            self.assertIn("National Agriculture Market", rec["source_attribution"])

        res_ag = mandi_price_service.get_prices(source="agmarknet", limit=10)
        self.assertEqual(res_ag["status"], "success")
        for rec in res_ag["records"]:
            self.assertEqual(rec["source"], "agmarknet")
            self.assertIn("Agmarknet", rec["source_attribution"])

    def test_multi_state_and_commodity_filtering(self):
        """Tests filtering across diverse Indian agricultural states and commodities."""
        test_filters = [
            {"state": "Haryana", "commodity": "Wheat"},
            {"state": "Punjab", "commodity": "Wheat"},
            {"state": "Maharashtra", "commodity": "Onion"},
            {"state": "Madhya Pradesh", "commodity": "Soyabean"},
            {"state": "Rajasthan", "commodity": "Mustard"},
            {"state": "Gujarat", "commodity": "Cotton"}
        ]

        for tf in test_filters:
            with self.subTest(state=tf["state"], commodity=tf["commodity"]):
                res = mandi_price_service.get_prices(state=tf["state"], commodity=tf["commodity"])
                self.assertEqual(res["status"], "success")
                records = res["records"]
                if records:
                    self.assertIn(tf["state"].lower(), records[0]["state"].lower())
                    self.assertIn(tf["commodity"].lower(), records[0]["commodity"].lower())

    def test_api_endpoint_agmarknet_and_enam(self):
        """Tests GET /api/markets/agmarknet endpoint with source query parameter."""
        res = client.get("/api/markets/agmarknet?source=enam&state=Haryana&commodity=Wheat")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["source_filter"], "enam")
        self.assertTrue(len(data["records"]) > 0)
        self.assertEqual(data["records"][0]["source"], "enam")

    def test_api_endpoint_compare_3way(self):
        """Tests GET /api/markets/compare endpoint comparing AgriPulse vs Agmarknet vs e-NAM."""
        res = client.get("/api/markets/compare?crop_id=wheat")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["crop"], "wheat")
        self.assertIn("comparison", data)
        self.assertGreater(len(data["comparison"]), 0)

        first_comp = data["comparison"][0]
        self.assertIn("agripulse_spot_price", first_comp)
        self.assertIn("agmarknet_modal_price", first_comp)
        self.assertIn("enam_modal_price", first_comp)
        self.assertIn("enam_spread_vs_agmarknet", first_comp)
        self.assertIn("active_sources", first_comp)

    def test_empty_or_unreported_market_graceful_handling(self):
        """Tests query for non-existent / non-reported market returns empty list without error."""
        res = mandi_price_service.get_prices(state="NonExistentState", commodity="NonExistentCrop")
        self.assertEqual(res["status"], "success")
        self.assertEqual(len(res["records"]), 0)
        self.assertEqual(res["returned_count"], 0)
        self.assertEqual(res["total_mandis_reporting"], 0)


if __name__ == "__main__":
    unittest.main()
