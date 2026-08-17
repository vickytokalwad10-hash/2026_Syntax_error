"""
AgriPulse AI — Crop Calendar & Dynamic Almanac Advisory Router
Provides personalized sowing-to-harvest lifecycle stages and automated milestone reminders for:
- Sharbati Wheat
- Basmati Rice / Paddy
- Mustard (Sarson)
- Soybean
- Cotton
- Gram (Chana)
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/calendar", tags=["Crop Calendar & Advisory"])

class CalendarGenerateRequest(BaseModel):
    crop_name: str # e.g. "Sharbati Wheat", "Basmati Rice", "Mustard", "Soybean", "Cotton", "Gram"
    region: Optional[str] = "Haryana / Punjab"
    soil_type: Optional[str] = "Alluvial Loam"
    sowing_date: Optional[str] = None # e.g. "2025-11-15"

def get_crop_milestones(crop_name: str, sowing_dt: datetime):
    c_lower = crop_name.lower()
    
    if "rice" in c_lower or "paddy" in c_lower or "basmati" in c_lower:
        duration = 125
        stages = [
            {"phase": "Nursery Preparation & Sowing", "offset": 0, "activity": "Treat seed with Carbendazim @ 2g/kg. Prepare raised wet nursery beds with FYM.", "prompt": "Nursery beds ready. Sow treated seed.", "icon": "grain"},
            {"phase": "Field Puddling & Transplanting", "offset": 25, "activity": "Transplant 25-day seedlings (2-3 seedlings/hill) at 20x15cm spacing. Maintain 2-3cm standing water.", "prompt": "Optimal transplanting window open. Apply basal DAP.", "icon": "water_drop"},
            {"phase": "Weed Control & Zinc Top-Dress", "offset": 40, "activity": "Apply Pretilachlor 50% EC @ 500ml/acre within 3 days. Top dress Zinc Sulfate (10 kg/acre).", "prompt": "Apply zinc top-dress and check for broadleaf weeds.", "icon": "pest_control"},
            {"phase": "Active Tillering & 1st Split Urea", "offset": 55, "activity": "Apply 1st split dose of Urea (40 kg/acre). Maintain saturated soil moisture.", "prompt": "Active tillering stage: Top dress Urea.", "icon": "spa"},
            {"phase": "Panicle Initiation & BPH Scouting", "offset": 75, "activity": "Scout for Brown Plant Hopper (BPH) and Stem Borer. Spray Cartap Hydrochloride 50% SP @ 400g/acre if required.", "prompt": "Critical panicle initiation: Scout lower tillers for BPH.", "icon": "visibility"},
            {"phase": "Flowering & Grain Filling", "offset": 100, "activity": "Apply 0:52:34 foliar spray @ 1 kg/acre for uniform grain elongation and weight.", "prompt": "Grain filling stage: Avoid water stress.", "icon": "psychology"},
            {"phase": "Physiological Maturity & Harvest", "offset": 125, "activity": "Drain standing water 10 days before harvest. Harvest when 85% grains turn golden.", "prompt": "Harvest readiness reached! Book combine harvester.", "icon": "inventory_2"}
        ]
    elif "mustard" in c_lower or "sarson" in c_lower:
        duration = 110
        stages = [
            {"phase": "Land Preparation & Sowing", "offset": 0, "activity": "Apply SSP (150 kg/acre) as basal source of sulfur. Sow seeds at 4-5cm depth with 30cm row spacing.", "prompt": "Optimal sowing window: Ensure sulfur application.", "icon": "grain"},
            {"phase": "Thinning & 1st Irrigation", "offset": 25, "activity": "Thin plants to maintain 10-15cm intra-row spacing. 1st irrigation at rosette stage.", "prompt": "Thinning stage: Maintain optimum plant population.", "icon": "water_drop"},
            {"phase": "Aphid & Sawfly Scouting", "offset": 45, "activity": "Inspect central shoots for mustard aphid colonies. Install yellow sticky traps @ 10/acre.", "prompt": "Scout for aphid colonies on inflorescence.", "icon": "pest_control"},
            {"phase": "Flowering & 2nd Irrigation", "offset": 60, "activity": "2nd light irrigation at peak flowering. Apply Sulfur 80% WDG @ 1 kg/acre foliar.", "prompt": "Flowering stage: Apply sulfur spray for high oil yield.", "icon": "spa"},
            {"phase": "Pod Development (Siliqua)", "offset": 85, "activity": "Monitor pod development. Spray Dimethoate 30% EC @ 1.5ml/L if aphid index exceeds ETL.", "prompt": "Pod filling stage: Protect against late aphid flush.", "icon": "visibility"},
            {"phase": "Maturity & Harvesting", "offset": 110, "activity": "Harvest early morning when pods turn yellowish brown to prevent seed shattering.", "prompt": "Harvest ready: Harvest early morning to avoid shattering.", "icon": "inventory_2"}
        ]
    elif "soybean" in c_lower:
        duration = 95
        stages = [
            {"phase": "Seed Inoculation & Sowing", "offset": 0, "activity": "Inoculate with Rhizobium japonicum + PSB @ 5g/kg seed. Sow on broad bed furrow (BBF).", "prompt": "Treat seeds with Rhizobium culture before sowing.", "icon": "grain"},
            {"phase": "Pre-Emergence Weed Spray", "offset": 3, "activity": "Spray Diclosulam 84% WDG @ 12.4g/acre within 48 hours of sowing.", "prompt": "Pre-emergence herbicide application window active.", "icon": "pest_control"},
            {"phase": "1st Inter-cultivation & Weeding", "offset": 20, "activity": "Run wheel hoe or inter-cultivator for soil aeration and root nodule activation.", "prompt": "Perform inter-cultivation for root aeration.", "icon": "agriculture"},
            {"phase": "Flowering & Semi-looper Scouting", "offset": 45, "activity": "Inspect for green semi-looper and tobacco caterpillar. Spray Emamectin Benzoate 5% SG @ 80g/acre.", "prompt": "Flowering stage: Scout for foliage feeding caterpillars.", "icon": "spa"},
            {"phase": "Pod Filling & Potassium Spray", "offset": 70, "activity": "Foliar spray of 13:0:45 (Potassium Nitrate) @ 1kg/acre to boost bold seed weight.", "prompt": "Pod development stage: Apply potassium foliar spray.", "icon": "visibility"},
            {"phase": "Maturity & Harvesting", "offset": 95, "activity": "Harvest when 90% leaves shed and pods produce rattling sound when shaken.", "prompt": "Harvest readiness: Thresh at 12-14% seed moisture.", "icon": "inventory_2"}
        ]
    elif "cotton" in c_lower or "kapas" in c_lower:
        duration = 165
        stages = [
            {"phase": "Sowing & Basal Nutrition", "offset": 0, "activity": "Dibble hybrid Bt cotton seeds at 90x60cm spacing. Apply DAP (50 kg/acre) + MOP (25 kg/acre).", "prompt": "Sow Bt cotton with proper spacing on ridges.", "icon": "grain"},
            {"phase": "Square Formation & Gap Filling", "offset": 45, "activity": "Gap fill missing hills. Spray Planofix @ 1ml/4.5L to prevent premature square drop.", "prompt": "Square initiation stage: Apply growth regulator.", "icon": "spa"},
            {"phase": "Flowering & Pink Bollworm Scouting", "offset": 75, "activity": "Install pheromone traps @ 5/acre. Inspect rosette flowers for pink bollworm larvae.", "prompt": "CRITICAL: Install pheromone traps for pink bollworm.", "icon": "pest_control"},
            {"phase": "Peak Boll Development", "offset": 115, "activity": "Apply 0:0:50 + Boron 20% foliar spray @ 500g/acre to prevent boll rot and internal drying.", "prompt": "Peak boll development: Supply micronutrient spray.", "icon": "visibility"},
            {"phase": "1st Picking", "offset": 140, "activity": "Pick clean, fully opened bolls into dry cotton bags during midday sunny hours.", "prompt": "1st picking ready! Ensure contamination-free picking.", "icon": "inventory_2"},
            {"phase": "Final Picking & Stalk Shredding", "offset": 165, "activity": "Complete final picking and shred cotton stalks with rotavator to destroy pink bollworm pupae.", "prompt": "Final picking complete: Shred stalks to destroy pest cycle.", "icon": "agriculture"}
        ]
    else: # Default: Sharbati Wheat
        duration = 140
        stages = [
            {"phase": "Land Preparation & Basal Fertilization", "offset": -5, "activity": "Deep ploughing + Rotavator. Apply FYM (2 tonnes/acre) + DAP (55 kg/acre) as basal dose.", "prompt": "Apply basal DAP and level field before sowing.", "icon": "agriculture"},
            {"phase": "Seed Sowing & Treatment", "offset": 0, "activity": "Treat seed with Trichoderma viride @ 5g/kg or Carboxin @ 2g/kg. Sow at 5cm depth with 20cm row spacing.", "prompt": "Optimal sowing window open. Check seed germination rate.", "icon": "grain"},
            {"phase": "Crown Root Initiation (CRI) & 1st Irrigation", "offset": 21, "activity": "Mandatory 1st Irrigation. Top-dress 1st dose of Urea (45 kg/acre) + Zinc Sulfate (10 kg/acre).", "prompt": "CRITICAL: 1st irrigation (CRI stage) due this week. Do not delay!", "icon": "water_drop"},
            {"phase": "Weed Control (Pre & Post Emergence)", "offset": 32, "activity": "Spray Clodinafop-propargyl 15% WP @ 160g/acre for grassy weeds (Gulli Danda / Phalaris minor).", "prompt": "Weed control window active. Spray herbicide under sunny conditions.", "icon": "pest_control"},
            {"phase": "Tillering & 2nd Irrigation", "offset": 45, "activity": "2nd Irrigation. Apply 2nd split dose of Urea (45 kg/acre) for maximum productive tillers.", "prompt": "Tillering stage: Apply 2nd Urea top-dress before irrigation.", "icon": "spa"},
            {"phase": "Booting / Earhead Emergence & 3rd Irrigation", "offset": 78, "activity": "3rd Irrigation. Inspect for Yellow Rust stripes on upper canopy leaves. Spray 0:52:34 (N-P-K) foliar @ 1kg/acre.", "prompt": "Monitor for yellow rust. Apply 0:52:34 foliar spray for grain formation.", "icon": "visibility"},
            {"phase": "Milking & Grain Filling (4th Irrigation)", "offset": 102, "activity": "Light 4th irrigation (avoid on windy days to prevent crop lodging). Apply 0:0:50 (Potash) @ 1kg/acre for bold grains.", "prompt": "Grain filling stage: Ensure adequate moisture, avoid heavy flooding.", "icon": "water_drop"},
            {"phase": "Physiological Maturity & Harvest", "offset": 140, "activity": "Harvest when grain moisture drops below 14% and straw turns golden yellow. Book combine harvester on AgriPulse Rentals.", "prompt": "Harvest readiness achieved! Book harvester and list lot on AgriPulse exchange.", "icon": "inventory_2"}
        ]

    milestones = []
    now = datetime.now()
    for s in stages:
        target_date = sowing_dt + timedelta(days=s["offset"])
        is_past = target_date < now
        is_current = abs((target_date - now).days) <= 7
        
        milestones.append({
            "phase": s["phase"],
            "day_range": f"Day {s['offset']} DAS" if s['offset'] > 0 else ("Day 0 (Sowing)" if s['offset'] == 0 else f"Day {s['offset']}"),
            "date": target_date.strftime("%d %b %Y"),
            "activity": s["activity"],
            "notification_prompt": s["prompt"],
            "icon": s["icon"],
            "status": "Current Stage" if is_current else ("Completed" if is_past else "Upcoming")
        })
        
    return duration, milestones

@router.post("/generate")
def generate_crop_calendar(req: CalendarGenerateRequest):
    """
    Generate dynamic sowing-to-harvest almanac calendar with milestone advisories.
    """
    sowing_dt = datetime.strptime(req.sowing_date, "%Y-%m-%d") if req.sowing_date else datetime.now()
    duration, milestones = get_crop_milestones(req.crop_name, sowing_dt)
    
    return {
        "status": "success",
        "crop": req.crop_name,
        "region": req.region,
        "soil_type": req.soil_type,
        "sowing_date": sowing_dt.strftime("%Y-%m-%d"),
        "expected_harvest_date": (sowing_dt + timedelta(days=duration)).strftime("%Y-%m-%d"),
        "total_crop_duration_days": duration,
        "milestones": milestones,
        "weather_adaptation_note": f"Adaptive schedule generated for {req.soil_type} in {req.region}. Sowing-to-harvest duration: {duration} days."
    }
