"""
Government Schemes & Subsidy Tracker Router
Provides endpoints for:
1. PM-KISAN installment lookup (Aadhaar/Mobile linked)
2. PMFBY Crop Insurance claim filing & tracking
3. Soil Health Card analysis & NPK fertilizer recommendations
4. State-specific subsidy alert feed

NOTE: Uses realistic mock data structured matching official government schemas.
Comments clearly mark where real GOVT API keys/endpoints should replace mocks.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/schemes", tags=["Government Schemes"])

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class PMKisanRequest(BaseModel):
    identifier: str # Aadhaar-linked Mobile or 12-digit Aadhaar Number

class PMFBYClaimRequest(BaseModel):
    farmer_name: str
    phone: str
    policy_number: str
    crop_name: str
    season: str
    affected_acres: float
    calamity_type: str # Inundation, Drought, Hailstorm, Pest Attack, Cyclone
    loss_percentage: int
    village_district: str
    bank_account_last4: str

class SoilHealthRequest(BaseModel):
    ph_level: float
    nitrogen_level: float # kg/ha
    phosphorus_level: float # kg/ha
    potassium_level: float # kg/ha
    organic_carbon_pct: float
    target_crop: str

# ---------------------------------------------------------------------------
# In-Memory Claim Store
# ---------------------------------------------------------------------------
MOCK_CLAIMS = [
    {
        "claim_id": "PMFBY-2026-8901",
        "farmer_name": "Ramesh Devidas Patil",
        "policy_number": "PMFBY/MH/2026/778921",
        "crop_name": "Sharbati Wheat",
        "season": "Rabi 2025-26",
        "affected_acres": 4.5,
        "calamity_type": "Hailstorm & Unseasonal Rain",
        "loss_percentage": 65,
        "status": "Under Review",
        "stages": [
            {"stage": "Claim Lodged", "date": "2026-02-10", "completed": True},
            {"stage": "Loss Assessment via Satellite & CCE", "date": "2026-02-14", "completed": True},
            {"stage": "State Govt & Insurance Co. Review", "date": "2026-02-18", "completed": False},
            {"stage": "Direct Benefit Transfer (DBT)", "date": "Pending Approval", "completed": False}
        ],
        "estimated_payout": 42500,
        "filed_at": "2026-02-10T14:30:00Z"
    }
]

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/pm-kisan/status")
def get_pm_kisan_status(payload: PMKisanRequest):
    """
    Check PM-KISAN DBT Installment Status.
    
    [INTEGRATION SWAP POINT]:
    Replace with PM-KISAN API gateway:
    Endpoint: https://pmkisan.gov.in/api/v1/beneficiaryStatus
    Headers: {'Authorization': 'Bearer <GOVT_DIGITAL_LOCKER_KEY>'}
    """
    clean_id = payload.identifier.strip()
    if len(clean_id) < 10:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit mobile or 12-digit Aadhaar number.")

    # Structured mock matching official PM-KISAN response
    return {
        "status": "success",
        "beneficiary": {
            "name": "Ramesh Devidas Patil",
            "state": "Maharashtra",
            "district": "Nashik",
            "village": "Dindori",
            "aadhaar_status": "Aadhaar Authenticated & Bank Account Seeded",
            "ekyc_status": "Done (Active)",
            "land_seeding": "YES",
            "total_installments_received": 18,
            "total_amount_credited": 36000,
            "next_expected_installment": "19th Installment (₹2,000)",
            "next_expected_date": "March 15, 2026",
            "recent_history": [
                {"installment": "18th", "amount": 2000, "date": "2025-11-20", "bank": "SBI - A/C **4589", "status": "FTO Generated & Payment Succeeded"},
                {"installment": "17th", "amount": 2000, "date": "2025-06-18", "bank": "SBI - A/C **4589", "status": "Payment Succeeded"},
                {"installment": "16th", "amount": 2000, "date": "2025-02-28", "bank": "SBI - A/C **4589", "status": "Payment Succeeded"}
            ]
        }
    }


@router.post("/pmfby/claim")
def submit_crop_insurance_claim(claim: PMFBYClaimRequest):
    """
    Submit PMFBY Crop Loss Insurance Claim.
    
    [INTEGRATION SWAP POINT]:
    Replace with PMFBY National Crop Insurance Portal:
    Endpoint: https://pmfby.gov.in/api/claim/intimate
    Payload: mapped Geo-tagged loss report + CCE (Crop Cutting Experiment) data
    """
    claim_id = f"PMFBY-2026-{len(MOCK_CLAIMS) + 9000}"
    payout = int(claim.affected_acres * 15000 * (claim.loss_percentage / 100.0))

    new_claim = {
        "claim_id": claim_id,
        "farmer_name": claim.farmer_name,
        "policy_number": claim.policy_number,
        "crop_name": claim.crop_name,
        "season": claim.season,
        "affected_acres": claim.affected_acres,
        "calamity_type": claim.calamity_type,
        "loss_percentage": claim.loss_percentage,
        "status": "Filed",
        "stages": [
            {"stage": "Claim Lodged", "date": datetime.now().strftime("%Y-%m-%d"), "completed": True},
            {"stage": "Loss Assessment via Satellite & CCE", "date": "Scheduled (48h)", "completed": False},
            {"stage": "State Govt & Insurance Co. Review", "date": "Pending", "completed": False},
            {"stage": "Direct Benefit Transfer (DBT)", "date": "Pending", "completed": False}
        ],
        "estimated_payout": payout,
        "filed_at": datetime.now().isoformat()
    }
    MOCK_CLAIMS.insert(0, new_claim)

    return {
        "status": "success",
        "message": f"Claim #{claim_id} intimating {claim.calamity_type} successfully registered with National Crop Insurance Portal.",
        "claim": new_claim
    }


@router.get("/pmfby/claims")
def get_pmfby_claims():
    """Retrieve all active crop insurance claims."""
    return {"status": "success", "claims": MOCK_CLAIMS}


@router.post("/soil-health/analyze")
def analyze_soil_health(payload: SoilHealthRequest):
    """
    Generate auto-fertilizer & nutrient advisory from Soil Health Card parameters.
    
    [INTEGRATION SWAP POINT]:
    Replace with Govt Soil Health Card Portal API:
    Endpoint: https://soilhealth.dac.gov.in/api/v1/recommendation
    """
    # Ideal Ranges: pH: 6.5-7.5, N: 280-560 kg/ha, P: 25-50 kg/ha, K: 150-300 kg/ha, OC: 0.5-0.75%
    ph = payload.ph_level
    n = payload.nitrogen_level
    p = payload.phosphorus_level
    k = payload.potassium_level
    oc = payload.organic_carbon_pct

    n_status = "Deficient" if n < 280 else "Excessive" if n > 560 else "Optimal"
    p_status = "Deficient" if p < 25 else "Excessive" if p > 50 else "Optimal"
    k_status = "Deficient" if k < 150 else "Excessive" if k > 300 else "Optimal"
    ph_status = "Acidic (Apply Lime)" if ph < 6.2 else "Alkaline (Apply Gypsum)" if ph > 7.8 else "Optimal Neutral"

    fertilizer_dosages = []
    if n_status == "Deficient":
        fertilizer_dosages.append("Urea (46% N): 110 kg/acre (split into 3 basal/tillering doses)")
    else:
        fertilizer_dosages.append("Urea: 75 kg/acre (maintain standard dose)")

    if p_status == "Deficient":
        fertilizer_dosages.append("DAP (18-46-0): 55 kg/acre as basal dose before sowing")
    else:
        fertilizer_dosages.append("SSP (Single Super Phosphate): 35 kg/acre")

    if k_status == "Deficient":
        fertilizer_dosages.append("MOP (Muriate of Potash 60% K2O): 40 kg/acre for disease resistance")

    if oc < 0.5:
        fertilizer_dosages.append("Farm Yard Manure (FYM) or Vermicompost: 2.5 tonnes/acre to restore Organic Carbon")

    return {
        "status": "success",
        "soil_summary": {
            "ph_status": ph_status,
            "nitrogen_status": n_status,
            "phosphorus_status": p_status,
            "potassium_status": k_status,
            "organic_carbon_status": "Low" if oc < 0.5 else "Good",
            "soil_health_index": round((min(ph, 7.5)/7.5 * 30) + (min(n, 500)/500 * 25) + (min(p, 40)/40 * 25) + (min(k, 250)/250 * 20), 1)
        },
        "recommendations": fertilizer_dosages,
        "target_crop": payload.target_crop
    }


@router.get("/subsidies")
def get_state_subsidies(state: Optional[str] = "All", category: Optional[str] = "All"):
    """
    State & Central Subsidy Alerts Feed.
    
    [INTEGRATION SWAP POINT]:
    Replace with DBT Agriculture / State Agriculture Portals (e.g. MahaDBT, AgriStack, Rajasthan Krishi).
    """
    subsidies = [
        {
            "id": "SUB-001",
            "title": "PM-KUSUM Component-B: Solar Agriculture Pump Subsidy",
            "state": "National / All States",
            "category": "Solar Pump",
            "subsidy_pct": "60% (30% Central + 30% State)",
            "beneficiary_share": "40% (with optional 30% bank loan)",
            "eligibility": "Farmers with grid-disconnected farmland or diesel pumps.",
            "last_date": "2026-04-30",
            "apply_url": "https://pmkusum.mnre.gov.in"
        },
        {
            "id": "SUB-002",
            "title": "Per Drop More Crop (PDMC): Micro-Irrigation (Drip/Sprinkler)",
            "state": "Maharashtra",
            "category": "Irrigation",
            "subsidy_pct": "75% for Small/Marginal Farmers; 55% for Others",
            "beneficiary_share": "25% - 45%",
            "eligibility": "7/12 Land extract holding water source (well/borewell).",
            "last_date": "2026-05-15",
            "apply_url": "https://mahadbt.maharashtra.gov.in"
        },
        {
            "id": "SUB-003",
            "title": "Sub-Mission on Agricultural Mechanization (SMAM): Rotavator & Happy Seeder",
            "state": "Punjab & Haryana",
            "category": "Equipment",
            "subsidy_pct": "50% Individual; 80% for Custom Hiring Centers (CHCs)",
            "beneficiary_share": "50% / 20%",
            "eligibility": "Aadhaar verified farmers registered on Meri Fasal Mera Byora.",
            "last_date": "2026-03-31",
            "apply_url": "https://agrimachinery.nic.in"
        },
        {
            "id": "SUB-004",
            "title": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) Farm Pond Subsidy",
            "state": "Madhya Pradesh",
            "category": "Irrigation",
            "subsidy_pct": "₹75,000 direct subsidy on plastic-lined farm pond construction",
            "beneficiary_share": "Varies by dimension",
            "eligibility": "Minimum 2 acres landholding without perennial canal.",
            "last_date": "2026-06-30",
            "apply_url": "https://dbt.mpdage.org"
        }
    ]

    filtered = subsidies
    if state and state != "All":
        filtered = [s for s in filtered if state.lower() in s["state"].lower() or "all states" in s["state"].lower()]
    if category and category != "All":
        filtered = [s for s in filtered if category.lower() in s["category"].lower()]

    return {"status": "success", "total": len(filtered), "subsidies": filtered}
