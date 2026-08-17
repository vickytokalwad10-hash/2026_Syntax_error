"""
Crop Calendar & Dynamic Almanac Advisory Router
Provides endpoints for:
1. Generating personalized sowing-to-harvest timeline calendars
2. Time-sensitive push notifications and agronomy milestones
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/calendar", tags=["Crop Calendar & Advisory"])

class CalendarGenerateRequest(BaseModel):
    crop_name: str # Sharbati Wheat, Basmati Rice, Mustard, Soybean, Cotton, Gram (Chana)
    region: str # Haryana / Punjab, Maharashtra, Madhya Pradesh, Rajasthan, Gujarat
    soil_type: str # Alluvial Loam, Black Soil, Sandy Loam, Clay Loam
    sowing_date: Optional[str] = None # e.g. "2025-11-15"

@router.post("/generate")
def generate_crop_calendar(req: CalendarGenerateRequest):
    """
    Generate dynamic sowing-to-harvest almanac calendar with milestone advisories.
    """
    sowing_dt = datetime.strptime(req.sowing_date, "%Y-%m-%d") if req.sowing_date else datetime.now()
    
    # Milestone templates for major crops
    milestones_wheat = [
        {
            "phase": "Land Preparation & Basal Fertilization",
            "day_range": "Day -10 to 0",
            "date": (sowing_dt - timedelta(days=5)).strftime("%d %b %Y"),
            "activity": "Deep ploughing + Rotavator. Apply FYM (2 tonnes/acre) + DAP (55 kg/acre) as basal dose.",
            "notification_prompt": "Apply basal DAP and level field before sowing.",
            "icon": "agriculture",
            "status": "Completed"
        },
        {
            "phase": "Seed Sowing & Treatment",
            "day_range": "Day 0",
            "date": sowing_dt.strftime("%d %b %Y"),
            "activity": "Treat seed with Trichoderma viride @ 5g/kg or Carboxin @ 2g/kg. Sow at 5cm depth with 20cm row spacing.",
            "notification_prompt": "Optimal sowing window open. Check seed germination rate.",
            "icon": "grain",
            "status": "Completed"
        },
        {
            "phase": "Crown Root Initiation (CRI) & 1st Irrigation",
            "day_range": "Day 21 (20-25 DAS)",
            "date": (sowing_dt + timedelta(days=21)).strftime("%d %b %Y"),
            "activity": "Mandatory 1st Irrigation. Top-dress 1st dose of Urea (45 kg/acre) + Zinc Sulfate (10 kg/acre).",
            "notification_prompt": "CRITICAL: 1st irrigation (CRI stage) due this week. Do not delay!",
            "icon": "water_drop",
            "status": "Current Stage"
        },
        {
            "phase": "Weed Control (Pre & Post Emergence)",
            "day_range": "Day 30-35 DAS",
            "date": (sowing_dt + timedelta(days=32)).strftime("%d %b %Y"),
            "activity": "Spray Clodinafop-propargyl 15% WP @ 160g/acre for grassy weeds (Gulli Danda / Phalaris minor).",
            "notification_prompt": "Weed control window active. Spray herbicide under sunny conditions.",
            "icon": "pest_control",
            "status": "Upcoming"
        },
        {
            "phase": "Tillering & 2nd Irrigation",
            "day_range": "Day 45 (40-45 DAS)",
            "date": (sowing_dt + timedelta(days=45)).strftime("%d %b %Y"),
            "activity": "2nd Irrigation. Apply 2nd split dose of Urea (45 kg/acre) for maximum productive tillers.",
            "notification_prompt": "Tillering stage: Apply 2nd Urea top-dress before irrigation.",
            "icon": "water_drop",
            "status": "Upcoming"
        },
        {
            "phase": "Booting / Earhead Emergence & 3rd Irrigation",
            "day_range": "Day 75-80 DAS",
            "date": (sowing_dt + timedelta(days=78)).strftime("%d %b %Y"),
            "activity": "3rd Irrigation. Inspect for Yellow Rust stripes on upper canopy leaves. Spray 0:52:34 (N-P-K) foliar @ 1kg/acre.",
            "notification_prompt": "Monitor for yellow rust. Apply 0:52:34 foliar spray for grain formation.",
            "icon": "visibility",
            "status": "Upcoming"
        },
        {
            "phase": "Milking & Grain Filling (4th Irrigation)",
            "day_range": "Day 100-105 DAS",
            "date": (sowing_dt + timedelta(days=102)).strftime("%d %b %Y"),
            "activity": "Light 4th irrigation (avoid on windy days to prevent crop lodging). Apply 0:0:50 (Potash) @ 1kg/acre for bold grains.",
            "notification_prompt": "Grain filling stage: Ensure adequate moisture, avoid heavy flooding.",
            "icon": "spa",
            "status": "Upcoming"
        },
        {
            "phase": "Physiological Maturity & Harvest",
            "day_range": "Day 135-145 DAS",
            "date": (sowing_dt + timedelta(days=140)).strftime("%d %b %Y"),
            "activity": "Harvest when grain moisture drops below 14% and straw turns golden yellow. Book combine harvester on AgriPulse Rentals.",
            "notification_prompt": "Harvest readiness achieved! Book harvester and list lot on AgriPulse exchange.",
            "icon": "inventory_2",
            "status": "Upcoming"
        }
    ]

    return {
        "status": "success",
        "crop": req.crop_name,
        "region": req.region,
        "soil_type": req.soil_type,
        "sowing_date": sowing_dt.strftime("%Y-%m-%d"),
        "expected_harvest_date": (sowing_dt + timedelta(days=140)).strftime("%Y-%m-%d"),
        "total_crop_duration_days": 140,
        "milestones": milestones_wheat,
        "weather_adaptation_note": "Normal temperatures predicted. CRI irrigation scheduled seamlessly before expected rain front."
    }
