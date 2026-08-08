from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List

router = APIRouter(prefix="/api/what-if", tags=["What-If Simulator"])

class SimulationRequest(BaseModel):
    crop_id: str = "wheat"
    yield_shock_pct: float = -15.0      # e.g., -15% due to heatwave
    export_duty_pct: float = 20.0       # e.g., 20% export tariff
    freight_cost_pct: float = 12.0      # e.g., +12% diesel hike
    rainfall_anomaly_pct: float = -20.0 # e.g., -20% monsoon deficit
    fertilizer_subsidy_pct: float = 0.0 # e.g., 0% status quo

BASE_CROP_PROFILES = {
    "wheat": {"name": "Wheat (Sharbati)", "base_price": 2840, "base_yield_q_acre": 18.5, "base_cost_acre": 24500, "price_elasticity": 0.65, "export_sensitivity": 0.28},
    "rice": {"name": "Paddy / Rice (Basmati)", "base_price": 3950, "base_yield_q_acre": 22.0, "base_cost_acre": 32000, "price_elasticity": 0.58, "export_sensitivity": 0.45},
    "cotton": {"name": "Cotton (Medium Staple)", "base_price": 7420, "base_yield_q_acre": 8.5, "base_cost_acre": 28000, "price_elasticity": 0.72, "export_sensitivity": 0.60},
    "soybean": {"name": "Soybean (Yellow)", "base_price": 4890, "base_yield_q_acre": 11.0, "base_cost_acre": 21000, "price_elasticity": 0.68, "export_sensitivity": 0.50},
    "maize": {"name": "Maize (Feed Grade)", "base_price": 2240, "base_yield_q_acre": 26.0, "base_cost_acre": 23000, "price_elasticity": 0.55, "export_sensitivity": 0.20},
    "mustard": {"name": "Mustard (Rapeseed)", "base_price": 5780, "base_yield_q_acre": 9.2, "base_cost_acre": 19500, "price_elasticity": 0.62, "export_sensitivity": 0.15},
    "onion": {"name": "Onion (Nashik Red)", "base_price": 2150, "base_yield_q_acre": 95.0, "base_cost_acre": 65000, "price_elasticity": 1.10, "export_sensitivity": 0.75},
    "tomato": {"name": "Tomato (Hybrid)", "base_price": 1820, "base_yield_q_acre": 120.0, "base_cost_acre": 82000, "price_elasticity": 1.35, "export_sensitivity": 0.30},
    "potato": {"name": "Potato (Jyoti)", "base_price": 1460, "base_yield_q_acre": 110.0, "base_cost_acre": 58000, "price_elasticity": 0.85, "export_sensitivity": 0.25}
}

@router.get("/presets")
def get_simulation_presets():
    return {
        "status": "success",
        "presets": [
            {
                "id": "heatwave_shock",
                "title": "Severe Heatwave during Grain Fill",
                "description": "Terminal heat shock in Northern belt cuts yields by 20% while diesel freight rises 10%.",
                "params": {"yield_shock_pct": -20.0, "export_duty_pct": 20.0, "freight_cost_pct": 10.0, "rainfall_anomaly_pct": -25.0, "fertilizer_subsidy_pct": 0.0}
            },
            {
                "id": "el_nino_drought",
                "title": "El Niño Induced Monsoon Deficit",
                "description": "30% rainfall deficit across Central India oilseed and pulse belts.",
                "params": {"yield_shock_pct": -25.0, "export_duty_pct": 30.0, "freight_cost_pct": 15.0, "rainfall_anomaly_pct": -35.0, "fertilizer_subsidy_pct": -10.0}
            },
            {
                "id": "bumper_harvest_glut",
                "title": "Bumper Production & Supply Glut",
                "description": "Record favorable weather boosts yields +25%, depressing open market prices below MSP.",
                "params": {"yield_shock_pct": 25.0, "export_duty_pct": -15.0, "freight_cost_pct": -5.0, "rainfall_anomaly_pct": 18.0, "fertilizer_subsidy_pct": 15.0}
            },
            {
                "id": "global_freight_spike",
                "title": "Crude Oil & Red Sea Maritime Disruption",
                "description": "Freight rates surge +35%, raising domestic export parity and fertilizer import costs.",
                "params": {"yield_shock_pct": -5.0, "export_duty_pct": 10.0, "freight_cost_pct": 35.0, "rainfall_anomaly_pct": 0.0, "fertilizer_subsidy_pct": -20.0}
            }
        ]
    }

@router.post("/simulate")
def simulate_scenario(req: SimulationRequest):
    profile = BASE_CROP_PROFILES.get(req.crop_id, BASE_CROP_PROFILES["wheat"])
    base_p = profile["base_price"]
    base_yield = profile["base_yield_q_acre"]
    base_cost = profile["base_cost_acre"]
    elas = profile["price_elasticity"]
    exp_sens = profile["export_sensitivity"]

    # Calculate net supply shock considering weather and yield parameter
    weather_impact_on_yield = (req.rainfall_anomaly_pct * 0.25)
    total_supply_shock_pct = req.yield_shock_pct + weather_impact_on_yield
    
    # Calculate price reaction: Inelastic agricultural demand means price moves inversely and proportionally
    price_impact_from_supply = -1.0 * total_supply_shock_pct * elas
    
    # Export duty impact: High duty lowers domestic price; duty cut boosts domestic price
    price_impact_from_export = -1.0 * req.export_duty_pct * exp_sens * 0.4
    
    # Freight cost impact on mandi spot price (passed partially to wholesale)
    price_impact_from_freight = req.freight_cost_pct * 0.18

    net_price_change_pct = round(price_impact_from_supply + price_impact_from_export + price_impact_from_freight, 2)
    simulated_price = round(base_p * (1.0 + (net_price_change_pct / 100.0)), 1)
    
    # Calculate simulated yield and input costs
    simulated_yield = max(1.0, round(base_yield * (1.0 + (total_supply_shock_pct / 100.0)), 2))
    fertilizer_cost_factor = 1.0 - (req.fertilizer_subsidy_pct * 0.003)
    freight_input_factor = 1.0 + (req.freight_cost_pct * 0.002)
    simulated_cost = round(base_cost * fertilizer_cost_factor * freight_input_factor, 0)
    
    # Farmer economics
    base_revenue = round(base_p * base_yield, 0)
    base_net_margin = round(base_revenue - base_cost, 0)
    
    sim_revenue = round(simulated_price * simulated_yield, 0)
    sim_net_margin = round(sim_revenue - simulated_cost, 0)
    margin_delta_pct = round(((sim_net_margin - base_net_margin) / max(1.0, base_net_margin)) * 100.0, 1)

    # Food inflation CPI impact score (Scale -5 to +5)
    cpi_impact_pts = round((net_price_change_pct * 0.12), 2)
    
    # Dynamic strategy recommendations
    recommendations = []
    if net_price_change_pct > 12.0:
        recommendations.append("High price realization projected: Implement staggered selling over 60 days to capture upside.")
        recommendations.append("Consider partial warehouse storage (WDRA accredited) to avoid immediate post-harvest glut discounting.")
    elif net_price_change_pct < -8.0:
        recommendations.append("Price depression risk: Register for government MSP procurement immediately to protect floor revenue.")
        recommendations.append("Hedge exposure using NCDEX commodity futures contracts or buy put options if available.")
    else:
        recommendations.append("Stable price corridor: Sell 40% immediate harvest to meet operational cash flow, store balance for 45 days.")

    if req.rainfall_anomaly_pct < -15.0:
        recommendations.append("Drought mitigation: Prioritize micro-irrigation scheduling and apply potassium nitrate foliar spray.")

    return {
        "status": "success",
        "crop": profile["name"],
        "parameters": req.dict(),
        "results": {
            "base_price": base_p,
            "simulated_price": simulated_price,
            "price_delta_pct": net_price_change_pct,
            "base_yield_q_acre": base_yield,
            "simulated_yield_q_acre": simulated_yield,
            "base_cost_per_acre": base_cost,
            "simulated_cost_per_acre": simulated_cost,
            "base_net_margin_per_acre": base_net_margin,
            "simulated_net_margin_per_acre": sim_net_margin,
            "margin_delta_pct": margin_delta_pct,
            "cpi_food_inflation_impact_pts": cpi_impact_pts,
            "mandi_arrival_pressure": "High" if total_supply_shock_pct > 10 else ("Deficit / Scarcity" if total_supply_shock_pct < -10 else "Balanced"),
            "strategic_recommendations": recommendations
        }
    }
