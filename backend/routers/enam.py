"""
AgriPulse AI — Government Mandi Prices Router
Directly interfaces with mandi_price_service (data.gov.in official Agmarknet feed).
"""

from fastapi import APIRouter, Query
from typing import Optional
from services.mandi_price_service import mandi_price_service

router = APIRouter(prefix="/api/markets", tags=["Government Agmarknet & e-NAM Mandi Prices"])


@router.get("/enam")
def get_enam_mandi_prices(
    state: Optional[str] = Query("All"),
    commodity: Optional[str] = Query("All"),
    district: Optional[str] = Query("All"),
    market: Optional[str] = Query("All")
):
    """
    Fetch official verified Agmarknet / e-NAM government price & arrival telemetry via data.gov.in.
    """
    res = mandi_price_service.get_prices(
        state=state,
        commodity=commodity,
        district=district,
        market=market,
        limit=50
    )
    # Adapt to legacy frontend consumption while providing complete schema
    return {
        "status": "success",
        "source": res.get("source"),
        "attribution": res.get("attribution"),
        "total_records": res.get("total_count", 0),
        "data": res.get("records", [])
    }
