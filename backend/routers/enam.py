"""
e-NAM (National Agriculture Market) Government Mandi Router
Provides endpoints for:
1. Public e-NAM official government mandi price feeds
2. Real-time modal price, arrivals volume, and mandi trade metrics

[INTEGRATION SWAP POINT]:
Replace mock feed with Ministry of Agriculture e-NAM Open API:
Endpoint: https://enam.gov.in/web/dashboard/trade-data
Headers: {'x-api-key': '<ENAM_GOVT_PORTAL_KEY>', 'Content-Type': 'application/json'}
"""

from fastapi import APIRouter
from typing import Optional, List

router = APIRouter(prefix="/api/markets", tags=["e-NAM Government Prices"])

MOCK_ENAM_PRICES = [
    {
        "mandi_code": "HR-KRN-01",
        "mandi_name": "Karnal APMC (e-NAM Linked)",
        "state": "Haryana",
        "district": "Karnal",
        "commodity": "Wheat",
        "variety": "Sharbati (Dara)",
        "modal_price": 2815,
        "min_price": 2750,
        "max_price": 2865,
        "msp_benchmark": 2425, # Govt Minimum Support Price
        "arrivals_tonnes": 480.5,
        "trade_type": "e-NAM Electronic Auction",
        "last_updated": "Today, 11:30 AM",
        "enwr_storage_eligible": True
    },
    {
        "mandi_code": "HR-TRW-02",
        "mandi_name": "Tarawadi APMC (e-NAM Linked)",
        "state": "Haryana",
        "district": "Karnal",
        "commodity": "Paddy (Basmati)",
        "variety": "Pusa 1121",
        "modal_price": 3920,
        "min_price": 3850,
        "max_price": 4010,
        "msp_benchmark": 2320,
        "arrivals_tonnes": 620.0,
        "trade_type": "e-NAM Electronic Auction",
        "last_updated": "Today, 12:15 PM",
        "enwr_storage_eligible": True
    },
    {
        "mandi_code": "MP-IND-01",
        "mandi_name": "Indore APMC (e-NAM Linked)",
        "state": "Madhya Pradesh",
        "district": "Indore",
        "commodity": "Soybean",
        "variety": "Yellow Standard (Non-GMO)",
        "modal_price": 4850,
        "min_price": 4720,
        "max_price": 4910,
        "msp_benchmark": 4892,
        "arrivals_tonnes": 890.0,
        "trade_type": "e-NAM Electronic Auction",
        "last_updated": "Today, 01:00 PM",
        "enwr_storage_eligible": True
    },
    {
        "mandi_code": "RJ-ALW-01",
        "mandi_name": "Alwar APMC (e-NAM Linked)",
        "state": "Rajasthan",
        "district": "Alwar",
        "commodity": "Mustard",
        "variety": "Bold Black",
        "modal_price": 5720,
        "min_price": 5600,
        "max_price": 5830,
        "msp_benchmark": 5950,
        "arrivals_tonnes": 340.0,
        "trade_type": "e-NAM Electronic Auction",
        "last_updated": "Today, 10:45 AM",
        "enwr_storage_eligible": True
    },
    {
        "mandi_code": "MH-NAG-01",
        "mandi_name": "Nagpur APMC (e-NAM Linked)",
        "state": "Maharashtra",
        "district": "Nagpur",
        "commodity": "Cotton",
        "variety": "Medium Staple (H4)",
        "modal_price": 7380,
        "min_price": 7150,
        "max_price": 7520,
        "msp_benchmark": 7121,
        "arrivals_tonnes": 210.0,
        "trade_type": "e-NAM Electronic Auction",
        "last_updated": "Today, 11:00 AM",
        "enwr_storage_eligible": True
    }
]

@router.get("/enam")
def get_enam_mandi_prices(state: Optional[str] = "All", commodity: Optional[str] = "All"):
    """
    Fetch official e-NAM (National Agriculture Market) price & arrival telemetry.
    """
    filtered = MOCK_ENAM_PRICES
    if state and state != "All":
        filtered = [p for p in filtered if state.lower() in p["state"].lower()]
    if commodity and commodity != "All":
        filtered = [p for p in filtered if commodity.lower() in p["commodity"].lower()]

    return {
        "status": "success",
        "source": "e-NAM Government National Portal (Mock Schema matching Open Data)",
        "total_records": len(filtered),
        "data": filtered
    }
