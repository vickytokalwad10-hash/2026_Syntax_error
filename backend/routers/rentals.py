"""
Equipment & Labor Sharing Router
Provides endpoints for:
1. Tractor & farm machinery rental marketplace (Type, HP, Daily Rate, Location, Owner Contact)
2. Seasonal farm labor availability & hiring board (Sowing, Harvesting, Spraying, Weeding)
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/rentals", tags=["Equipment & Labor Sharing"])

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class EquipmentListingRequest(BaseModel):
    title: str # e.g. Mahindra 575 DI (45 HP) + Rotavator
    equipment_type: str # Tractor, Combine Harvester, Drone Sprayer, Laser Leveler, Seed Drill
    daily_rate_inr: int
    hourly_rate_inr: Optional[int] = None
    includes_operator: bool = True
    includes_fuel: bool = False
    village_district: str
    owner_name: str
    owner_phone: str

class LaborPostRequest(BaseModel):
    leader_name: str
    team_size: int
    skills: List[str] # Manual Paddy Harvesting, Cotton Picking, Sugarcane Cutting, Spraying
    daily_wage_per_person: int
    available_from: str
    available_to: str
    village_district: str
    contact_phone: str

# ---------------------------------------------------------------------------
# In-Memory Seed Storage
# ---------------------------------------------------------------------------
MOCK_EQUIPMENT = [
    {
        "id": "EQ-101",
        "title": "Mahindra 575 DI (45 HP) + 7ft Rotavator",
        "equipment_type": "Tractor",
        "daily_rate_inr": 2800,
        "hourly_rate_inr": 450,
        "includes_operator": True,
        "includes_fuel": False,
        "village_district": "Karnal West, Haryana",
        "owner_name": "Sukhwinder Singh",
        "owner_phone": "9812345670",
        "verified": True,
        "status": "Available Now",
        "rating": 4.9,
        "reviews_count": 28
    },
    {
        "id": "EQ-102",
        "title": "John Deere W70 Multi-Crop Combine Harvester",
        "equipment_type": "Combine Harvester",
        "daily_rate_inr": 12000,
        "hourly_rate_inr": 1800,
        "includes_operator": True,
        "includes_fuel": True,
        "village_district": "Kurukshetra, Haryana",
        "owner_name": "Baldev Ram",
        "owner_phone": "9898765432",
        "verified": True,
        "status": "Booked till Thursday",
        "rating": 4.8,
        "reviews_count": 42
    },
    {
        "id": "EQ-103",
        "title": "DJI Agras T40 Agriculture Drone Sprayer (40L Tank)",
        "equipment_type": "Drone Sprayer",
        "daily_rate_inr": 4500,
        "hourly_rate_inr": 350, # Per acre rate
        "includes_operator": True, # DGCA certified drone pilot
        "includes_fuel": True,
        "village_district": "Panipat, Haryana",
        "owner_name": "AgroAero Services FPO",
        "owner_phone": "9876501234",
        "verified": True,
        "status": "Available Now",
        "rating": 5.0,
        "reviews_count": 19
    },
    {
        "id": "EQ-104",
        "title": "Laser Land Leveler + 55HP Dual Clutch Tractor",
        "equipment_type": "Laser Leveler",
        "daily_rate_inr": 3500,
        "hourly_rate_inr": 600,
        "includes_operator": True,
        "includes_fuel": False,
        "village_district": "Ambala, Haryana",
        "owner_name": "Gurmeet Singh",
        "owner_phone": "9811223344",
        "verified": True,
        "status": "Available Now",
        "rating": 4.7,
        "reviews_count": 15
    }
]

MOCK_LABOR = [
    {
        "id": "LAB-201",
        "leader_name": "Mukesh Kumar & Team",
        "team_size": 12,
        "skills": ["Manual Wheat Harvesting", "Threshing & Bagging", "Laser Sowing"],
        "daily_wage_per_person": 450,
        "available_from": "2026-03-01",
        "available_to": "2026-04-15",
        "village_district": "Gharaunda, Karnal (HR)",
        "contact_phone": "9801122334",
        "verified": True,
        "rating": 4.9
    },
    {
        "id": "LAB-202",
        "leader_name": "Shyam Sundar Toli",
        "team_size": 8,
        "skills": ["Paddy Nursery Raising", "Transplanting", "Weeding"],
        "daily_wage_per_person": 400,
        "available_from": "2026-06-15",
        "available_to": "2026-07-30",
        "village_district": "Nilokheri, Karnal (HR)",
        "contact_phone": "9899887766",
        "verified": True,
        "rating": 4.8
    }
]

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/equipment")
def get_equipment_listings(equipment_type: Optional[str] = "All", district: Optional[str] = "All"):
    """List all available farm machinery rentals."""
    filtered = MOCK_EQUIPMENT
    if equipment_type and equipment_type != "All":
        filtered = [e for e in filtered if equipment_type.lower() in e["equipment_type"].lower()]
    if district and district != "All":
        filtered = [e for e in filtered if district.lower() in e["village_district"].lower()]

    return {"status": "success", "total": len(filtered), "equipment": filtered}


@router.post("/equipment")
def list_equipment(payload: EquipmentListingRequest):
    """List a new tractor/machinery on the rental exchange."""
    new_item = {
        "id": f"EQ-{len(MOCK_EQUIPMENT) + 101}",
        "title": payload.title,
        "equipment_type": payload.equipment_type,
        "daily_rate_inr": payload.daily_rate_inr,
        "hourly_rate_inr": payload.hourly_rate_inr or int(payload.daily_rate_inr / 8),
        "includes_operator": payload.includes_operator,
        "includes_fuel": payload.includes_fuel,
        "village_district": payload.village_district,
        "owner_name": payload.owner_name,
        "owner_phone": payload.owner_phone,
        "verified": True,
        "status": "Available Now",
        "rating": 5.0,
        "reviews_count": 1
    }
    MOCK_EQUIPMENT.insert(0, new_item)
    return {"status": "success", "message": "Equipment listing published to rental board!", "item": new_item}


@router.get("/labor")
def get_labor_listings(district: Optional[str] = "All"):
    """List seasonal farm labor availability boards."""
    filtered = MOCK_LABOR
    if district and district != "All":
        filtered = [l for l in filtered if district.lower() in l["village_district"].lower()]
    return {"status": "success", "total": len(filtered), "labor_teams": filtered}


@router.post("/labor")
def post_labor_availability(payload: LaborPostRequest):
    """Post farm labor availability for seasonal operations."""
    new_team = {
        "id": f"LAB-{len(MOCK_LABOR) + 201}",
        "leader_name": payload.leader_name,
        "team_size": payload.team_size,
        "skills": payload.skills,
        "daily_wage_per_person": payload.daily_wage_per_person,
        "available_from": payload.available_from,
        "available_to": payload.available_to,
        "village_district": payload.village_district,
        "contact_phone": payload.contact_phone,
        "verified": True,
        "rating": 5.0
    }
    MOCK_LABOR.insert(0, new_team)
    return {"status": "success", "message": "Labor availability posted to community board!", "team": new_team}
