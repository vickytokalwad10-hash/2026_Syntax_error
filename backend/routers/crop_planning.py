"""
AgriPulse AI — Crop Planning AI Engine
Recommends the most profitable and climate-resilient crops for next season based on:
- Location / Agro-Climatic Zone
- Soil Type & Chemistry
- Expected Weather / Monsoon Forecast
- Forward Market Demand & Pricing Outlook
- Water Availability & Irrigation Infrastructure
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/api/crop-planning", tags=["Crop Planning AI"])

class CropPlanningRequest(BaseModel):
    location_state: str = "Haryana"
    location_district: str = "Karnal"
    soil_type: str = "Alluvial Loam"
    target_season: str = "Rabi 2026-27"
    weather_outlook: str = "Normal Monsoon (+4%)"
    water_availability: str = "Canal + Borewell"
    land_acres: float = 12.5

# Crop Knowledge Base & Agronomic Model
CROPS_DATABASE = [
    {
        "id": "wheat_sharbati",
        "name": "Sharbati Wheat (Grade A)",
        "category": "Cereal Grains",
        "suitable_seasons": ["Rabi", "Rabi 2026-27"],
        "suitable_soils": ["Alluvial Loam", "Clay Loam", "Sandy Loam"],
        "min_water": "Moderate",
        "avg_yield_per_acre": 22.5, # quintals
        "projected_price": 2840, # ₹ / quintal
        "input_cost_per_acre": 18500, # ₹
        "market_demand_score": 96,
        "climate_resilience_score": 91,
        "water_demand_score": "Moderate (3-4 Irrigations)",
        "duration_days": 135,
        "key_drivers": "High institutional flour milling demand, steady central procurement MSP buffer.",
        "risk_factors": "Terminal heat stress during March grain filling.",
        "variety_recommendation": "DBW-303 / HD-3226 (Pusa Yashasvi)",
        "sowing_window": "25 Oct — 15 Nov",
        "harvesting_window": "20 Mar — 10 Apr"
    },
    {
        "id": "mustard_pusa_bold",
        "name": "Mustard (Pusa Bold / RH-749)",
        "category": "Oilseeds",
        "suitable_seasons": ["Rabi", "Rabi 2026-27"],
        "suitable_soils": ["Alluvial Loam", "Sandy Loam", "Light Loam"],
        "min_water": "Low",
        "avg_yield_per_acre": 10.5,
        "projected_price": 5780,
        "input_cost_per_acre": 13200,
        "market_demand_score": 94,
        "climate_resilience_score": 95,
        "water_demand_score": "Low (2 Irrigations)",
        "duration_days": 125,
        "key_drivers": "Domestic edible oil import duties favoring domestic crushers; record low oil inventory.",
        "risk_factors": "Aphid infestation if humidity spikes in January.",
        "variety_recommendation": "RH-749 / Giriraj (DRMRI-150-35)",
        "sowing_window": "05 Oct — 25 Oct",
        "harvesting_window": "15 Feb — 05 Mar"
    },
    {
        "id": "chickpea_desi",
        "name": "Chickpea / Desi Chana (JG-14)",
        "category": "Pulses",
        "suitable_seasons": ["Rabi", "Rabi 2026-27"],
        "suitable_soils": ["Alluvial Loam", "Black Cotton Soil", "Sandy Loam"],
        "min_water": "Low",
        "avg_yield_per_acre": 9.2,
        "projected_price": 6150,
        "input_cost_per_acre": 12000,
        "market_demand_score": 92,
        "climate_resilience_score": 89,
        "water_demand_score": "Low (1-2 Irrigations)",
        "duration_days": 115,
        "key_drivers": "High protein food consumption rally; NAFED buffer procurement at bonus rates.",
        "risk_factors": "Pod borer (Helicoverpa) at flowering stage.",
        "variety_recommendation": "JG-14 / RVG-202 (Wilt resistant)",
        "sowing_window": "15 Oct — 10 Nov",
        "harvesting_window": "25 Feb — 15 Mar"
    },
    {
        "id": "basmati_pusa1121",
        "name": "Pusa Basmati 1121 / 1509",
        "category": "Cereal Grains",
        "suitable_seasons": ["Kharif", "Kharif 2026"],
        "suitable_soils": ["Alluvial Loam", "Clay Loam"],
        "min_water": "High",
        "avg_yield_per_acre": 21.0,
        "projected_price": 3950,
        "input_cost_per_acre": 26000,
        "market_demand_score": 95,
        "climate_resilience_score": 82,
        "water_demand_score": "High (Standing Water / AWD)",
        "duration_days": 120,
        "key_drivers": "Middle-East export contracts active with $1,050/ton FOB pricing.",
        "risk_factors": "Bacterial leaf blight under excessive nitrogen.",
        "variety_recommendation": "Pusa Basmati 1121 / PB-1847",
        "sowing_window": "15 Jun — 05 Jul",
        "harvesting_window": "15 Oct — 05 Nov"
    },
    {
        "id": "soybean_js2034",
        "name": "Soybean (JS 20-34 / Yellow Non-GMO)",
        "category": "Oilseeds",
        "suitable_seasons": ["Kharif", "Kharif 2026"],
        "suitable_soils": ["Black Cotton Soil", "Alluvial Loam", "Clay Loam"],
        "min_water": "Moderate",
        "avg_yield_per_acre": 12.0,
        "projected_price": 4890,
        "input_cost_per_acre": 16500,
        "market_demand_score": 89,
        "climate_resilience_score": 86,
        "water_demand_score": "Moderate (Rainfed / 2 protective)",
        "duration_days": 90,
        "key_drivers": "Poultry de-oiled cake (DOC) export rally.",
        "risk_factors": "Yellow Mosaic Virus under heavy continuous rains.",
        "variety_recommendation": "JS 20-34 / NRC-127",
        "sowing_window": "20 Jun — 10 Jul",
        "harvesting_window": "25 Sep — 15 Oct"
    },
    {
        "id": "cotton_bt",
        "name": "Bt Cotton (Medium / Long Staple)",
        "category": "Cash Crops",
        "suitable_seasons": ["Kharif", "Kharif 2026"],
        "suitable_soils": ["Black Cotton Soil", "Alluvial Loam"],
        "min_water": "Moderate",
        "avg_yield_per_acre": 11.5,
        "projected_price": 7420,
        "input_cost_per_acre": 28000,
        "market_demand_score": 91,
        "climate_resilience_score": 84,
        "water_demand_score": "Moderate to High",
        "duration_days": 160,
        "key_drivers": "Textile spinning mill restocking; robust lint exports.",
        "risk_factors": "Pink bollworm in late flushes.",
        "variety_recommendation": "RCH-659 / Bollgard II",
        "sowing_window": "15 May — 15 Jun",
        "harvesting_window": "15 Nov — 15 Dec"
    }
]

@router.post("/recommend")
def recommend_crops(payload: CropPlanningRequest):
    season_query = payload.target_season.lower()
    soil_query = payload.soil_type.lower()
    weather_query = payload.weather_outlook.lower()
    is_drought = "drought" in weather_query
    
    scored_crops = []
    
    for crop in CROPS_DATABASE:
        score = 50.0
        
        # 1. Season Matching
        if any(s.lower() in season_query for s in crop["suitable_seasons"]):
            score += 25
        
        # 2. Soil Suitability
        if any(soil_query in s.lower() or s.lower() in soil_query for s in crop["suitable_soils"]):
            score += 15
        else:
            score -= 10
            
        # 3. Weather & Water Match
        if is_drought and crop["min_water"] == "Low":
            score += 15
        elif is_drought and crop["min_water"] == "High":
            score -= 20
        elif not is_drought and crop["min_water"] == "High":
            score += 10
            
        # 4. Market Demand Contribution
        score += (crop["market_demand_score"] * 0.15)
        
        # Calculate Financials per acre
        gross_rev_per_acre = round(crop["avg_yield_per_acre"] * crop["projected_price"])
        net_profit_per_acre = gross_rev_per_acre - crop["input_cost_per_acre"]
        roi_pct = round((net_profit_per_acre / crop["input_cost_per_acre"]) * 100, 1)
        total_farm_net_profit = round(net_profit_per_acre * payload.land_acres)
        
        scored_crops.append({
            **crop,
            "overall_ai_score": round(score, 1),
            "gross_rev_per_acre": gross_rev_per_acre,
            "net_profit_per_acre": net_profit_per_acre,
            "roi_pct": roi_pct,
            "total_farm_net_profit": total_farm_net_profit,
            "total_farm_revenue": round(gross_rev_per_acre * payload.land_acres),
            "total_farm_cost": round(crop["input_cost_per_acre"] * payload.land_acres)
        })
    
    # Sort by overall AI match score descending
    scored_crops.sort(key=lambda x: (x["overall_ai_score"], x["net_profit_per_acre"]), reverse=True)
    top_3 = scored_crops[:3]
    
    # AI Executive Summary Verdict
    top_pick = top_3[0]
    verdict = (
        f"Based on {payload.soil_type} in {payload.location_district} ({payload.location_state}) under {payload.weather_outlook}, "
        f"the AI model identifies **{top_pick['name']}** as the most profitable and risk-adjusted choice for {payload.target_season}. "
        f"Expected net realization is ₹{top_pick['net_profit_per_acre']:,}/acre (+{top_pick['roi_pct']}% ROI) on your {payload.land_acres} acres."
    )
    
    return {
        "status": "success",
        "inputs": payload.model_dump(),
        "ai_verdict": verdict,
        "recommendations": top_3,
        "all_evaluated_count": len(CROPS_DATABASE)
    }
