from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(prefix="/api/markets", tags=["Markets & APMC Mandi Optimizer"])

MANDIS_CATALOG = [
    {"id": "khanna_pb", "name": "Khanna APMC", "state": "Punjab", "district": "Ludhiana", "lat": 30.7046, "lng": 76.2163, "cess_pct": 2.0, "handling_fee_per_q": 25, "crops": {"wheat": 2890, "paddy": 3980, "maize": 2210, "mustard": 5720}},
    {"id": "azadpur_dl", "name": "Azadpur Mandi", "state": "Delhi", "district": "North Delhi", "lat": 28.7126, "lng": 77.1772, "cess_pct": 1.5, "handling_fee_per_q": 35, "crops": {"wheat": 2940, "paddy": 4120, "onion": 2320, "tomato": 2040, "potato": 1620, "mustard": 5850}},
    {"id": "lasalgaon_mh", "name": "Lasalgaon Mandi", "state": "Maharashtra", "district": "Nashik", "lat": 20.1472, "lng": 74.2253, "cess_pct": 1.8, "handling_fee_per_q": 20, "crops": {"onion": 2240, "soybean": 4920, "cotton": 7380, "wheat": 2790}},
    {"id": "vashi_mh", "name": "Vashi APMC", "state": "Maharashtra", "district": "Navi Mumbai", "lat": 19.0760, "lng": 72.9986, "cess_pct": 2.2, "handling_fee_per_q": 40, "crops": {"onion": 2410, "tomato": 2180, "potato": 1690, "rice": 4200, "wheat": 2980}},
    {"id": "indore_mp", "name": "Indore APMC", "state": "Madhya Pradesh", "district": "Indore", "lat": 22.7196, "lng": 75.8577, "cess_pct": 1.5, "handling_fee_per_q": 22, "crops": {"soybean": 4980, "wheat": 2860, "gram": 5600, "mustard": 5790, "onion": 2080}},
    {"id": "rajkot_gj", "name": "Rajkot Mandi", "state": "Gujarat", "district": "Rajkot", "lat": 22.3039, "lng": 70.8022, "cess_pct": 1.7, "handling_fee_per_q": 24, "crops": {"cotton": 7520, "groundnut": 6300, "wheat": 2810, "cumin": 28500}},
    {"id": "unjha_gj", "name": "Unjha APMC", "state": "Gujarat", "district": "Mehsana", "lat": 23.8037, "lng": 72.3934, "cess_pct": 1.6, "handling_fee_per_q": 30, "crops": {"cumin": 29400, "mustard": 5890, "fennel": 16500, "wheat": 2830}},
    {"id": "guntur_ap", "name": "Guntur APMC", "state": "Andhra Pradesh", "district": "Guntur", "lat": 16.3067, "lng": 80.4365, "cess_pct": 2.0, "handling_fee_per_q": 28, "crops": {"cotton": 7480, "paddy": 3920, "chilli": 19800, "maize": 2290}},
    {"id": "karnal_hr", "name": "Karnal Mandi", "state": "Haryana", "district": "Karnal", "lat": 29.6857, "lng": 76.9905, "cess_pct": 2.0, "handling_fee_per_q": 25, "crops": {"paddy": 4080, "wheat": 2880, "mustard": 5750, "sugarcane": 355}}
]

class MandiOptimizeRequest(BaseModel):
    crop_id: str = "wheat"
    origin_district: str = "Karnal, Haryana"
    quantity_quintals: float = 100.0
    diesel_rate_per_liter: float = 89.5

@router.get("/overview")
def get_markets_overview():
    return {
        "status": "success",
        "total_tracked_mandis": len(MANDIS_CATALOG),
        "mandis": MANDIS_CATALOG,
        "supported_crops": [
            {"id": "wheat", "name": "Wheat (Sharbati)"},
            {"id": "rice", "name": "Paddy / Rice (Basmati)"},
            {"id": "cotton", "name": "Cotton (Medium Staple)"},
            {"id": "soybean", "name": "Soybean (Yellow)"},
            {"id": "mustard", "name": "Mustard (Rapeseed)"},
            {"id": "onion", "name": "Onion (Nashik Red)"},
            {"id": "tomato", "name": "Tomato (Hybrid)"},
            {"id": "potato", "name": "Potato (Jyoti)"},
            {"id": "maize", "name": "Maize (Feed Grade)"}
        ]
    }

@router.post("/optimize")
def optimize_mandi_sales(req: MandiOptimizeRequest):
    crop_id = req.crop_id.lower()
    qty = max(1.0, req.quantity_quintals)
    
    # Distance estimation mockup from typical agricultural origins
    distance_map = {
        "khanna_pb": 130,
        "azadpur_dl": 145,
        "karnal_hr": 25,
        "lasalgaon_mh": 1180,
        "vashi_mh": 1360,
        "indore_mp": 860,
        "rajkot_gj": 1120,
        "unjha_gj": 940,
        "guntur_ap": 1780
    }

    evaluated_mandis = []
    
    for mandi in MANDIS_CATALOG:
        crop_rates = mandi["crops"]
        if crop_id in crop_rates:
            gross_price = crop_rates[crop_id]
            dist_km = distance_map.get(mandi["id"], 250)
            
            # Transport cost calculation: Base freight ₹1.8/km/quintal with truckload economy
            freight_cost_per_q = round(max(35.0, dist_km * 1.65 * (req.diesel_rate_per_liter / 90.0)), 1)
            cess_cost_per_q = round(gross_price * (mandi["cess_pct"] / 100.0), 1)
            handling_fee = mandi["handling_fee_per_q"]
            
            total_deductions_per_q = round(freight_cost_per_q + cess_cost_per_q + handling_fee, 1)
            net_realized_price = round(gross_price - total_deductions_per_q, 1)
            total_net_payout = round(net_realized_price * qty, 0)
            
            evaluated_mandis.append({
                "mandi_id": mandi["id"],
                "mandi_name": mandi["name"],
                "state": mandi["state"],
                "district": mandi["district"],
                "lat": mandi["lat"],
                "lng": mandi["lng"],
                "distance_km": dist_km,
                "gross_spot_price": gross_price,
                "freight_cost_per_q": freight_cost_per_q,
                "cess_cost_per_q": cess_cost_per_q,
                "handling_fee_per_q": handling_fee,
                "total_deductions_per_q": total_deductions_per_q,
                "net_realized_price_per_q": net_realized_price,
                "total_net_payout": total_net_payout
            })

    # Sort descending by net realized price
    evaluated_mandis.sort(key=lambda x: x["net_realized_price_per_q"], reverse=True)
    best_mandi = evaluated_mandis[0] if evaluated_mandis else None
    
    if evaluated_mandis:
        evaluated_mandis[0]["is_optimal"] = True
        for m in evaluated_mandis[1:]:
            m["is_optimal"] = False
            m["loss_vs_optimal_per_q"] = round(best_mandi["net_realized_price_per_q"] - m["net_realized_price_per_q"], 1)

    # Generate Sell Now vs Store Matrix for the best Mandi spot
    base_spot = best_mandi["gross_spot_price"] if best_mandi else 2840
    
    # Cost assumptions for WDRA accredited warehouse storage
    storage_fee_per_month_q = 28.0   # ₹28/quintal/month
    interest_on_working_capital_pct = 9.0 / 12.0 # 0.75% per month
    weight_loss_rate_per_month = 0.6 # 0.6% natural moisture loss/month
    
    matrix_horizons = [
        {"horizon": "Sell Now (Day 0)", "days": 0, "expected_price": base_spot, "storage_cost": 0, "interest_cost": 0, "weight_loss_pct": 0.0, "forecast_confidence": "100%"},
        {"horizon": "Store 15 Days", "days": 15, "expected_price": round(base_spot * 1.028, 1), "storage_cost": 14, "interest_cost": round(base_spot * 0.00375, 1), "weight_loss_pct": 0.3, "forecast_confidence": "94%"},
        {"horizon": "Store 30 Days", "days": 30, "expected_price": round(base_spot * 1.062, 1), "storage_cost": 28, "interest_cost": round(base_spot * 0.0075, 1), "weight_loss_pct": 0.6, "forecast_confidence": "89%"},
        {"horizon": "Store 60 Days", "days": 60, "expected_price": round(base_spot * 1.125, 1), "storage_cost": 56, "interest_cost": round(base_spot * 0.015, 1), "weight_loss_pct": 1.2, "forecast_confidence": "82%"},
        {"horizon": "Store 90 Days", "days": 90, "expected_price": round(base_spot * 1.178, 1), "storage_cost": 84, "interest_cost": round(base_spot * 0.0225, 1), "weight_loss_pct": 1.8, "forecast_confidence": "74%"}
    ]
    
    for row in matrix_horizons:
        effective_qty = (1.0 - (row["weight_loss_pct"] / 100.0))
        gross_value = row["expected_price"] * effective_qty
        total_costs = row["storage_cost"] + row["interest_cost"]
        net_return_per_q = round(gross_value - total_costs, 1)
        net_gain_vs_now = round(net_return_per_q - base_spot, 1)
        roi_pct = round((net_gain_vs_now / base_spot) * 100.0, 2)
        
        row["net_return_per_q"] = net_return_per_q
        row["net_gain_vs_now_per_q"] = net_gain_vs_now
        row["roi_pct"] = roi_pct
        row["recommendation"] = "Recommended" if roi_pct > 4.5 else ("Marginal Gain" if roi_pct > 0 else "Avoid Storage")

    return {
        "status": "success",
        "query": req.dict(),
        "optimal_mandi": best_mandi,
        "mandi_arbitrage_rankings": evaluated_mandis,
        "sell_vs_store_matrix": matrix_horizons,
        "ai_decision_badge": {
            "action": "STORE 30-60 DAYS IN WDRA WAREHOUSE",
            "payout_gain_estimate": f"+₹{round(matrix_horizons[3]['net_gain_vs_now_per_q'] * qty, 0):,} total payout gain",
            "key_reason": "Post-harvest terminal arrivals will dry up in 3 weeks, creating a 12.5% spot price appreciation in northern consuming states."
        }
    }
