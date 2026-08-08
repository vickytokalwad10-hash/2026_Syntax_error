from fastapi import APIRouter
from datetime import datetime, timedelta
from typing import List, Dict, Any

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Anomaly Intelligence"])

ALERTS_FEED = [
    {
        "id": "alt-001",
        "title": "Severe Heatwave Spike (+4.2°C above normal)",
        "category": "Weather Shock",
        "severity": "Critical",
        "timestamp": "12 mins ago",
        "affected_regions": ["Punjab", "Haryana", "Western UP", "Northern Rajasthan"],
        "impacted_crops": ["Wheat", "Mustard"],
        "metric_trigger": "Surface Temp > 38.5°C during sensitive grain development",
        "details": "IMD heatwave warning for next 72 hours. Potential premature ripening and 4-6% shriveled grain risk if irrigation is delayed.",
        "action_required": "Initiate light evening irrigation immediately; apply 2% Potassium Nitrate (13-0-45) spray to boost heat tolerance."
    },
    {
        "id": "alt-002",
        "title": "Tomato Spot Rate Volatility Surge (+18.4% in 48h)",
        "category": "Price Volatility",
        "severity": "Critical",
        "timestamp": "45 mins ago",
        "affected_regions": ["Kolar (Karnataka)", "Madanapalle (AP)", "Azadpur (Delhi)"],
        "impacted_crops": ["Tomato (Hybrid)"],
        "metric_trigger": "Daily Price Delta > +15% with 42% decline in Mandi arrivals",
        "details": "Heavy unseasonal localized downpours disrupted harvesting in southern transit hubs, creating supply bottlenecks in northern metropolitan mandis.",
        "action_required": "Sellers in unhindered belts should harvest mature green tomatoes for long-distance transport to capitalize on spot premiums."
    },
    {
        "id": "alt-003",
        "title": "DGFT Notification: Onion Export MEP Adjusted",
        "category": "Trade Policy",
        "severity": "Warning",
        "timestamp": "2 hours ago",
        "affected_regions": ["Maharashtra (Nashik)", "Gujarat (Bhavnagar)", "Madhya Pradesh"],
        "impacted_crops": ["Onion (Nashik Red)"],
        "metric_trigger": "Minimum Export Price (MEP) reduced to $400/MT",
        "details": "Government lowers export restrictions to support domestic farmers amidst healthy Rabi buffer stocks. Gulf export enquiries picking up.",
        "action_required": "Hold export-quality (45mm+ size) onion stocks for 10-14 days to realize an estimated 8-12% price gain."
    },
    {
        "id": "alt-004",
        "title": "Pink Bollworm Infestation Detected in Semi-Arid Cotton Belt",
        "category": "Pest & Disease",
        "severity": "Warning",
        "timestamp": "5 hours ago",
        "affected_regions": ["Saurashtra (Gujarat)", "Vidarbha (Maharashtra)", "Bathinda (Punjab)"],
        "impacted_crops": ["Cotton (Medium Staple)"],
        "metric_trigger": "Pheromone trap catch exceeded ETL (8 moths/trap/night)",
        "details": "Early emergence of Pink Bollworm larvae in second-flush bolls detected through Sentinel-2 spectral vegetation anomalies.",
        "action_required": "Install delta traps with gossyplure lures; spray Profenofos 50% EC @ 2ml/L water or Emamectin Benzoate 5% SG."
    },
    {
        "id": "alt-005",
        "title": "Soybean Crush Margin Expansion & Mandi Arrival Surge",
        "category": "Market Flow",
        "severity": "Advisory",
        "timestamp": "8 hours ago",
        "affected_regions": ["Indore", "Ujjain", "Dewas (Madhya Pradesh)"],
        "impacted_crops": ["Soybean (Yellow)"],
        "metric_trigger": "Crush Margin expanded by ₹140/Q on strong De-oiled Cake (DOC) export bids",
        "details": "Solvent extraction plants operating at 88% capacity. Mandi gate prices trading ₹180 above statutory MSP.",
        "action_required": "Favorable liquidity window: Liquidate up to 50% of stored soybean stocks at current ₹4,980/Q peaks."
    },
    {
        "id": "alt-006",
        "title": "Hailstorm Risk in Western Maharashtra Grape & Pomegranate Hubs",
        "category": "Weather Shock",
        "severity": "Warning",
        "timestamp": "14 hours ago",
        "affected_regions": ["Nashik", "Sangli", "Solapur (Maharashtra)"],
        "impacted_crops": ["Horticulture", "Onion"],
        "metric_trigger": "Convective thunderstorm index CAPE > 2400 J/kg",
        "details": "Severe squall lines and isolated hail activity predicted over the next 36 hours.",
        "action_required": "Deploy anti-hail nets where available; ensure drainage trenches are cleared of debris."
    }
]

@router.get("")
def get_alerts():
    return {
        "status": "success",
        "total_active_alerts": len(ALERTS_FEED),
        "critical_count": sum(1 for a in ALERTS_FEED if a["severity"] == "Critical"),
        "warning_count": sum(1 for a in ALERTS_FEED if a["severity"] == "Warning"),
        "advisory_count": sum(1 for a in ALERTS_FEED if a["severity"] == "Advisory"),
        "alerts": ALERTS_FEED
    }
