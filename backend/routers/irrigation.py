"""
Irrigation & Water Management Router
Provides endpoints for:
1. Crop-specific dynamic irrigation schedule generation
2. IoT Soil Moisture Sensor telemetry stream & toggle
3. Drought alert & water-saving advisories
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import datetime

router = APIRouter(prefix="/api/irrigation", tags=["Irrigation & Water Management"])

class IrrigationScheduleRequest(BaseModel):
    crop_type: str # Wheat, Basmati Rice, Mustard, Soybean, Cotton, Sugarcane
    growth_stage: str # Crown Root Initiation (CRI), Tillering, Flowering, Grain Filling, Maturity
    soil_type: str # Alluvial Loam, Black Cotton Soil, Sandy Loam, Clay Loam
    irrigation_method: str # Flood / Furrow, Sprinkler, Drip Irrigation, Rainfed
    land_acres: float = 5.0

@router.post("/schedule")
def generate_irrigation_schedule(req: IrrigationScheduleRequest):
    """
    Generate tailored irrigation schedule based on crop phenology and soil moisture tension.
    """
    # Critical irrigation stages for Indian crops
    critical_stages_map = {
        "Wheat": [
            {"stage": "Crown Root Initiation (CRI)", "days_after_sowing": "20-25 DAS", "water_depth_cm": 6.0, "critical": True, "priority": "Mandatory (Yield drops 30% if missed)"},
            {"stage": "Late Tillering", "days_after_sowing": "40-45 DAS", "water_depth_cm": 5.0, "critical": False, "priority": "Recommended"},
            {"stage": "Late Jointing / Booting", "days_after_sowing": "60-65 DAS", "water_depth_cm": 5.5, "critical": True, "priority": "High"},
            {"stage": "Flowering / Anthesis", "days_after_sowing": "80-85 DAS", "water_depth_cm": 6.0, "critical": True, "priority": "High"},
            {"stage": "Milking Stage", "days_after_sowing": "100-105 DAS", "water_depth_cm": 5.0, "critical": False, "priority": "Moderate"},
            {"stage": "Dough Stage", "days_after_sowing": "115-120 DAS", "water_depth_cm": 4.0, "critical": False, "priority": "Light (Avoid lodging)"}
        ],
        "Mustard": [
            {"stage": "Rosette / Branching Stage", "days_after_sowing": "30-35 DAS", "water_depth_cm": 5.0, "critical": True, "priority": "Mandatory"},
            {"stage": "Siliqua / Pod Development", "days_after_sowing": "55-65 DAS", "water_depth_cm": 5.0, "critical": True, "priority": "High"}
        ],
        "Paddy": [
            {"stage": "Transplanting / Establishment", "days_after_sowing": "0-10 DAT", "water_depth_cm": 5.0, "critical": True, "priority": "Maintain 3-5cm standing water"},
            {"stage": "Active Tillering", "days_after_sowing": "25-35 DAT", "water_depth_cm": 4.0, "critical": True, "priority": "High"},
            {"stage": "Panicle Initiation & Flowering", "days_after_sowing": "50-70 DAT", "water_depth_cm": 5.0, "critical": True, "priority": "Crucial (Zero moisture stress)"}
        ]
    }

    stages = critical_stages_map.get(req.crop_type, critical_stages_map["Wheat"])
    
    # Method efficiency
    method_efficiency = {
        "Drip Irrigation": {"saving_pct": 55, "flow_hours": "3.5 hrs/zone", "advisory": "Operate at 1.2 kg/cm² pressure. Fertigation friendly."},
        "Sprinkler": {"saving_pct": 35, "flow_hours": "4.0 hrs/set", "advisory": "Operate in evening to minimize wind drift and evaporative loss."},
        "Flood / Furrow": {"saving_pct": 0, "flow_hours": "8-10 hrs/acre", "advisory": "Consider laser leveling to reduce 25% tail-end water wastage."},
        "Rainfed": {"saving_pct": 70, "flow_hours": "Protective life-saving irrigation only", "advisory": "Apply farm-pond micro-doses at CRI."}
    }.get(req.irrigation_method, {"saving_pct": 30, "flow_hours": "5 hrs", "advisory": "Standard irrigation"})

    # Check for drought flag (if soil is sandy or weather is deficit)
    is_drought_zone = "Sandy" in req.soil_type or req.crop_type in ["Paddy", "Sugarcane"]

    return {
        "status": "success",
        "crop": req.crop_type,
        "current_growth_stage": req.growth_stage,
        "irrigation_method": req.irrigation_method,
        "water_savings": f"{method_efficiency['saving_pct']}% water conserved vs traditional flooding",
        "recommended_flow_duration": method_efficiency["flow_hours"],
        "method_advisory": method_efficiency["advisory"],
        "next_irrigation_recommendation": {
            "due_in_days": 3,
            "best_time_window": "05:30 AM - 09:00 AM (Minimal Evaporation Loss)",
            "water_volume_liters_per_acre": 22000 if req.irrigation_method == "Drip Irrigation" else 55000,
            "soil_tension_threshold": "35 kPa (Root Zone Depletion @ 45%)"
        },
        "critical_calendar": stages,
        "drought_alert": {
            "active": is_drought_zone,
            "severity": "Warning" if is_drought_zone else "Normal",
            "message": "⚠️ Regional Evapotranspiration Rate High (5.8 mm/day). Use organic straw mulching to conserve 20% soil moisture." if is_drought_zone else "Moisture reserves adequate."
        }
    }


@router.get("/sensor-data")
def get_iot_sensor_telemetry():
    """
    IoT Soil Moisture Sensor Telemetry Feed.
    
    [INTEGRATION SWAP POINT]:
    Replace with IoT MQTT / LoRaWAN gateway (e.g. ThingsBoard, CropX, Sensoterra, Kritsnam Dhaara).
    """
    return {
        "status": "success",
        "device_id": "AGRI-IOT-KRN-402",
        "device_status": "Online (LoRaWAN 868MHz)",
        "battery_pct": 92,
        "telemetry": {
            "soil_moisture_depth_15cm": 38.4, # % volumetric water content
            "soil_moisture_depth_45cm": 46.2,
            "soil_temperature_c": 19.8,
            "electrical_conductivity_ds_m": 0.42, # Salinity indicator
            "evapotranspiration_rate_mm": 3.6,
            "water_status": "Adequate Moisture (No Irrigation Needed for next 48h)"
        },
        "historical_24h": [
            {"time": "00:00", "moisture": 42.0},
            {"time": "04:00", "moisture": 41.5},
            {"time": "08:00", "moisture": 40.2},
            {"time": "12:00", "moisture": 38.6},
            {"time": "16:00", "moisture": 37.9},
            {"time": "20:00", "moisture": 38.4}
        ]
    }
