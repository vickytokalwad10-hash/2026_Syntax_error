from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import random
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/api/direct-trade",
    tags=["Direct Farmer-to-Buyer Trade"]
)

# Simulated in-memory database of active farmer listings and buyer demands
FARMER_LISTINGS = [
    {
        "id": "LIST-801",
        "farmer_name": "Sardar Harpreet Singh",
        "farmer_contact": "+91 98765-43210",
        "state": "Punjab",
        "district": "Ludhiana",
        "crop_id": "wheat",
        "crop_name": "Wheat (Sharbati Gold)",
        "variety": "HD-3086 Premium",
        "lot_size_quintals": 120,
        "asking_price_per_q": 2880,
        "moisture_pct": 11.2,
        "organic_certified": True,
        "quality_grade": "Grade A+",
        "pickup_ready_date": "Ready for Immediate Farmgate Pickup",
        "farmgate_address": "Farm Gate #4, GT Road, Khanna Sub-district, Ludhiana",
        "views_count": 42,
        "active_bids_count": 3,
        "highest_bid": 2850,
        "created_at": "2 hours ago",
        "status": "ACTIVE"
    },
    {
        "id": "LIST-802",
        "farmer_name": "Rameshwar Patil",
        "farmer_contact": "+91 94220-11234",
        "state": "Maharashtra",
        "district": "Nashik",
        "crop_id": "onion",
        "crop_name": "Onion (Nashik Red Garwa)",
        "variety": "Bhima Dark Red",
        "lot_size_quintals": 250,
        "asking_price_per_q": 2350,
        "moisture_pct": 12.8,
        "organic_certified": False,
        "quality_grade": "Grade A Export Size (55mm+)",
        "pickup_ready_date": "Ready from 12th Aug",
        "farmgate_address": "Lasalgaon Road, Pimpalgaon Baswant, Nashik",
        "views_count": 89,
        "active_bids_count": 6,
        "highest_bid": 2320,
        "created_at": "5 hours ago",
        "status": "ACTIVE"
    },
    {
        "id": "LIST-803",
        "farmer_name": "Devendra Gurjar",
        "farmer_contact": "+91 98261-77890",
        "state": "Madhya Pradesh",
        "district": "Indore",
        "crop_id": "soybean",
        "crop_name": "Soybean (Yellow Non-GMO)",
        "variety": "JS-9560 High Oil",
        "lot_size_quintals": 180,
        "asking_price_per_q": 4820,
        "moisture_pct": 10.5,
        "organic_certified": True,
        "quality_grade": "Non-GMO Export Standard",
        "pickup_ready_date": "Ready for Immediate Farmgate Pickup",
        "farmgate_address": "Village Sanwer, Dhar Road, Indore Rural",
        "views_count": 31,
        "active_bids_count": 4,
        "highest_bid": 4790,
        "created_at": "1 day ago",
        "status": "ACTIVE"
    },
    {
        "id": "LIST-804",
        "farmer_name": "Gurmeet Singh Mann",
        "farmer_contact": "+91 97800-22345",
        "state": "Haryana",
        "district": "Karnal",
        "crop_id": "rice",
        "crop_name": "Paddy / Rice (Basmati 1121)",
        "variety": "Traditional Pusa 1121",
        "lot_size_quintals": 300,
        "asking_price_per_q": 3750,
        "moisture_pct": 12.0,
        "organic_certified": False,
        "quality_grade": "Extra Long Grain (8.35mm)",
        "pickup_ready_date": "Ready for Farmgate Pickup",
        "farmgate_address": "Taraori Bypass, Karnal",
        "views_count": 115,
        "active_bids_count": 8,
        "highest_bid": 3720,
        "created_at": "3 hours ago",
        "status": "ACTIVE"
    }
]

BUYER_DEMANDS = [
    {
        "id": "RFQ-501",
        "buyer_company": "ITC Choupal Sourcing Ltd",
        "buyer_type": "Institutional FMCG Processor",
        "buyer_location": "Chandigarh / Delhi NCR Hub",
        "verified_badge": "Verified Institutional Buyer",
        "crop_id": "wheat",
        "crop_name": "Wheat (Sharbati / Atta Grade)",
        "target_volume_mt": 500,
        "max_bid_price_per_q": 2875,
        "payment_terms": "Instant UPI / RTGS Escrow (Within 4 hours of QC)",
        "logistics": "Buyer arranges farmgate transport",
        "min_lot_quintals": 50,
        "urgent": True
    },
    {
        "id": "RFQ-502",
        "buyer_company": "Adani Wilmar Agri Foods",
        "buyer_type": "Edible Oil & Meal Extraction Plant",
        "buyer_location": "Indore / Pithampur SEZ",
        "verified_badge": "Verified Mega Processor",
        "crop_id": "soybean",
        "crop_name": "Soybean (Yellow Oil Grade)",
        "target_volume_mt": 1200,
        "max_bid_price_per_q": 4810,
        "payment_terms": "Direct e-Mandi Escrow 100% Guaranteed",
        "logistics": "Buyer sends fleet to farmgate",
        "min_lot_quintals": 100,
        "urgent": True
    },
    {
        "id": "RFQ-503",
        "buyer_company": "Reliance Fresh Sourcing Direct",
        "buyer_type": "National Supermarket Retail Chain",
        "buyer_location": "Navi Mumbai / Pune Central Warehouse",
        "verified_badge": "Verified Retail Giant",
        "crop_id": "onion",
        "crop_name": "Onion (Grade A Red)",
        "target_volume_mt": 350,
        "max_bid_price_per_q": 2340,
        "payment_terms": "Immediate T+0 Escrow Settlement",
        "logistics": "Farmgate pickup arranged",
        "min_lot_quintals": 50,
        "urgent": False
    },
    {
        "id": "RFQ-504",
        "buyer_company": "KRBL Rice Mills (India Gate)",
        "buyer_type": "Global Rice Exporter",
        "buyer_location": "Sonipat / Delhi NCR Processing Plant",
        "verified_badge": "Verified Export Conglomerate",
        "crop_id": "rice",
        "crop_name": "Paddy / Rice (Basmati 1121 / 1509)",
        "target_volume_mt": 800,
        "max_bid_price_per_q": 3740,
        "payment_terms": "Escrow Bank Guarantee on Weighment",
        "logistics": "Buyer truck dispatch to farmgate",
        "min_lot_quintals": 100,
        "urgent": True
    },
    {
        "id": "RFQ-505",
        "buyer_company": "Vardhman Textiles & Ginning",
        "buyer_type": "Cotton Spinning & Textile Mill",
        "buyer_location": "Ludhiana / Baddi Hub",
        "verified_badge": "Verified Textile Mill",
        "crop_id": "cotton",
        "crop_name": "Cotton (Medium & Long Staple)",
        "target_volume_mt": 400,
        "max_bid_price_per_q": 7320,
        "payment_terms": "Direct RTGS Escrow 24h",
        "logistics": "Farmgate collection",
        "min_lot_quintals": 40,
        "urgent": False
    }
]

class NewListingRequest(BaseModel):
    farmer_name: str
    farmer_contact: str
    state: str
    district: str
    crop_id: str
    crop_name: str
    variety: str
    lot_size_quintals: float
    asking_price_per_q: float
    moisture_pct: float
    organic_certified: bool
    quality_grade: str
    farmgate_address: str

class DealContractRequest(BaseModel):
    listing_id: Optional[str] = None
    buyer_company: str
    farmer_name: str
    crop_name: str
    agreed_price_per_q: float
    quantity_quintals: float
    farmgate_address: str
    payment_terms: str

@router.get("/listings")
def get_farmer_listings():
    """Retrieve all active farmer direct listings"""
    return {
        "status": "success",
        "total_active_listings": len(FARMER_LISTINGS),
        "listings": FARMER_LISTINGS
    }

@router.get("/buyers")
def get_buyer_demands():
    """Retrieve verified institutional buyers & live purchase RFQs"""
    return {
        "status": "success",
        "total_active_rfqs": len(BUYER_DEMANDS),
        "buyer_demands": BUYER_DEMANDS
    }

@router.post("/list")
def create_farmer_listing(req: NewListingRequest):
    """Post a new crop lot directly from farmgate"""
    new_id = f"LIST-{random.randint(810, 999)}"
    new_item = {
        "id": new_id,
        "farmer_name": req.farmer_name,
        "farmer_contact": req.farmer_contact,
        "state": req.state,
        "district": req.district,
        "crop_id": req.crop_id,
        "crop_name": req.crop_name,
        "variety": req.variety,
        "lot_size_quintals": req.lot_size_quintals,
        "asking_price_per_q": req.asking_price_per_q,
        "moisture_pct": req.moisture_pct,
        "organic_certified": req.organic_certified,
        "quality_grade": req.quality_grade,
        "pickup_ready_date": "Immediate Farmgate Pickup",
        "farmgate_address": req.farmgate_address,
        "views_count": 1,
        "active_bids_count": 0,
        "highest_bid": req.asking_price_per_q - 20,
        "created_at": "Just now",
        "status": "ACTIVE"
    }
    FARMER_LISTINGS.insert(0, new_item)
    return {
        "status": "success",
        "message": "Harvest lot listed successfully on direct buyer network!",
        "listing": new_item
    }

@router.get("/margin-calculator")
def calculate_margin_elimination(crop_id: str = "wheat", lot_size: float = 100, direct_price: float = 2880):
    """
    Compares Traditional APMC Mandi Deductions (Arthiya Commission 2.5%, Mandi Tax 2%, Freight, Labour, Weighment)
    vs Direct Farmgate Sale (0% commission, buyer pays freight).
    """
    apmc_benchmark_rates = {
        "wheat": 2620,
        "rice": 3480,
        "cotton": 7050,
        "soybean": 4560,
        "mustard": 5300,
        "onion": 2080,
        "tomato": 1950,
        "potato": 1520
    }
    base_apmc = apmc_benchmark_rates.get(crop_id, 2600)
    
    # Mandi deductions
    arthiya_comm = round(base_apmc * 0.025, 1)  # 2.5%
    mandi_tax = round(base_apmc * 0.020, 1)     # 2.0%
    freight_to_mandi = 45.0                      # ₹/Q
    labour_unloading = 18.0                      # ₹/Q
    total_deductions_per_q = round(arthiya_comm + mandi_tax + freight_to_mandi + labour_unloading, 1)
    
    net_mandi_price_per_q = base_apmc - total_deductions_per_q
    total_mandi_net_payout = round(net_mandi_price_per_q * lot_size, 0)
    
    # Direct Sale (Ex-Farmgate)
    total_direct_payout = round(direct_price * lot_size, 0)
    
    extra_profit = round(total_direct_payout - total_mandi_net_payout, 0)
    extra_profit_pct = round((extra_profit / total_mandi_net_payout) * 100, 1) if total_mandi_net_payout > 0 else 0
    
    return {
        "crop_id": crop_id,
        "lot_size_quintals": lot_size,
        "traditional_mandi": {
            "gross_mandi_price": base_apmc,
            "arthiya_commission_per_q": arthiya_comm,
            "mandi_tax_cess_per_q": mandi_tax,
            "farmer_freight_per_q": freight_to_mandi,
            "handling_labour_per_q": labour_unloading,
            "total_deductions_per_q": total_deductions_per_q,
            "net_received_per_q": net_mandi_price_per_q,
            "total_net_payout": total_mandi_net_payout
        },
        "direct_farmgate_sale": {
            "agreed_direct_price_per_q": direct_price,
            "commission_fee": 0,
            "freight_borne_by": "Institutional Buyer",
            "total_net_payout": total_direct_payout
        },
        "extra_profit_earned": extra_profit,
        "extra_profit_percentage": extra_profit_pct,
        "middleman_eliminated_value": round(total_deductions_per_q * lot_size, 0)
    }

@router.post("/deal")
def create_deal_contract(req: DealContractRequest):
    """Generate a digital smart escrow contract token for direct sale"""
    contract_id = f"AGRI-ESCROW-{random.randint(100000, 999999)}"
    total_amount = round(req.agreed_price_per_q * req.quantity_quintals, 2)
    return {
        "status": "success",
        "contract_id": contract_id,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "farmer_name": req.farmer_name,
        "buyer_company": req.buyer_company,
        "crop_name": req.crop_name,
        "quantity_quintals": req.quantity_quintals,
        "agreed_price_per_q": req.agreed_price_per_q,
        "total_deal_value": total_amount,
        "escrow_status": "LOCKED IN ESCROW (100% Guaranteed)",
        "farmgate_pickup_address": req.farmgate_address,
        "pickup_window": f"{(datetime.now() + timedelta(days=1)).strftime('%d %b %Y')} to {(datetime.now() + timedelta(days=3)).strftime('%d %b %Y')}",
        "qc_parameters": "Visual moisture probe <= 12%, No foreign matter > 1.5%",
        "qr_code_token": f"https://agripulse.ai/verify-deal/{contract_id}"
    }
