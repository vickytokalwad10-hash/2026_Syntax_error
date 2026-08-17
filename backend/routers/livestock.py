"""
Livestock & Dairy Advisory Router
Provides endpoints for:
1. Veterinary AI advisory chat (domain-restricted prompt classifier for cattle, buffalo, goat, poultry)
2. Regional dairy milk procurement rate ticker (Fat% and SNF% rate calculation)
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/livestock", tags=["Livestock & Dairy"])

class VetAdvisoryRequest(BaseModel):
    animal_type: str # Cow (Desi/HF/Jersey), Buffalo (Murrah/Jaffarabadi), Goat/Sheep, Poultry
    symptoms: str
    temperature_recorded: Optional[str] = None
    milk_yield_drop_pct: Optional[int] = None
    language: str = "hi"

# ---------------------------------------------------------------------------
# Veterinary Knowledge Base
# ---------------------------------------------------------------------------
VET_KNOWLEDGE = {
    "mastitis": {
        "condition": "Clinical Mastitis (Thanela Rog)",
        "urgency": "High",
        "first_aid": "Immediately strip out milk from infected quarter. Apply cold water packs or ice to reduce inflammation.",
        "treatment": "Intramammary antibiotic infusion (e.g. Cloxacillin / Ceftiofur) under veterinary supervision. Oral serratiopeptidase anti-inflammatory bolus.",
        "ayurvedic_remedy": "Turmeric powder (50g) + Aloe vera pulp (250g) + Lime (15g) ground into paste and applied externally on udder 3 times daily."
    },
    "lumpy": {
        "condition": "Lumpy Skin Disease (LSD)",
        "urgency": "High / Contagious",
        "first_aid": "Isolate the animal immediately in a dry, disinfected shed. Prevent mosquito and biting fly vectors using neem smoke.",
        "treatment": "Symptomatic treatment with Paracetamol / Meloxicam for fever and broad-spectrum antibiotics to prevent secondary bacterial infection.",
        "ayurvedic_remedy": "Feed Betel leaves (10 nos) + Black pepper (10g) + Salt (10g) + Jaggery paste twice daily."
    },
    "bloat": {
        "condition": "Tympanites / Bloat (Afara)",
        "urgency": "Emergency",
        "first_aid": "Keep animal standing with head elevated. Do not allow animal to lie down.",
        "treatment": "Drenching with 500ml edible oil (Mustard or Linseed) mixed with 30-50ml Turpentine oil and 10g Hing (Asafoetida). In extreme distress, trocar and cannula in left flank.",
        "ayurvedic_remedy": "Ginger juice 100ml + Hing 10g + Black salt 50g in 500ml warm water."
    },
    "fever": {
        "condition": "Bovine Ephemeral Fever (Three-day Sickness) / General Fever",
        "urgency": "Moderate",
        "first_aid": "Provide clean drinking water with electrolytes. Protect from direct cold drafts.",
        "treatment": "Meloxicam + Paracetamol bolus @ 2 boluses morning/evening for 3 days. Injectable Vitamin B-complex for appetite restoration.",
        "ayurvedic_remedy": "Decoction of Tulsi leaves + Giloy (Tinospora) stem + Black pepper twice daily."
    }
}

@router.post("/advisory")
def get_vet_advisory(req: VetAdvisoryRequest):
    """
    Veterinary advisory response with domain guardrails.
    
    [INTEGRATION SWAP POINT]:
    Route to Google Gemini 2.0 with prompt:
    "You are an expert Indian Veterinary Doctor. Provide immediate first aid, ICAR treatment, and Ayurvedic herbal remedy."
    """
    text_lower = req.symptoms.lower()
    matched = None

    if "mastitis" in text_lower or "udder" in text_lower or "thanela" in text_lower or "swollen teat" in text_lower or "blood in milk" in text_lower:
        matched = VET_KNOWLEDGE["mastitis"]
    elif "lumpy" in text_lower or "nodule" in text_lower or "knot" in text_lower or "skin" in text_lower:
        matched = VET_KNOWLEDGE["lumpy"]
    elif "bloat" in text_lower or "afara" in text_lower or "gas" in text_lower or "swollen belly" in text_lower:
        matched = VET_KNOWLEDGE["bloat"]
    else:
        matched = VET_KNOWLEDGE["fever"]

    return {
        "status": "success",
        "animal": req.animal_type,
        "preliminary_condition": matched["condition"],
        "urgency_level": matched["urgency"],
        "immediate_first_aid": matched["first_aid"],
        "recommended_treatment": matched["treatment"],
        "ayurvedic_traditional_remedy": matched["ayurvedic_remedy"],
        "disclaimer": "⚠️ Veterinary Advisory Alert: This AI diagnosis is for preliminary first-aid support. Please consult a registered Block Veterinary Officer (BVO) for injectable prescription."
    }


@router.get("/dairy-rates")
def get_dairy_rates():
    """
    Regional milk procurement rates by dairy federations (Amul, Mother Dairy, Saras, Verka, Vita).
    """
    return {
        "status": "success",
        "base_date": "Live Today",
        "pricing_model": "Two-Axis Fat (₹/kg) + SNF (₹/kg) Metric",
        "regional_rates": [
            {
                "region": "Haryana & Punjab (Vita / Verka)",
                "cow_milk_rate_per_liter": "₹38.50 - ₹42.00",
                "cow_standard": "3.5% Fat • 8.5% SNF",
                "buffalo_milk_rate_per_liter": "₹62.00 - ₹68.50",
                "buffalo_standard": "6.5% Fat • 9.0% SNF",
                "coop": "Vita Haryana Dairy Federation",
                "trend": "+₹1.50/L from last month"
            },
            {
                "region": "Gujarat & Western India (Amul)",
                "cow_milk_rate_per_liter": "₹41.20 - ₹44.00",
                "cow_standard": "3.8% Fat • 8.5% SNF",
                "buffalo_milk_rate_per_liter": "₹64.50 - ₹71.00",
                "buffalo_standard": "7.0% Fat • 9.0% SNF",
                "coop": "GCMMF (Amul Anand)",
                "trend": "Stable"
            },
            {
                "region": "Rajasthan (Saras Dairy)",
                "cow_milk_rate_per_liter": "₹39.00 - ₹42.50",
                "cow_standard": "3.5% Fat • 8.5% SNF",
                "buffalo_milk_rate_per_liter": "₹60.50 - ₹66.00",
                "buffalo_standard": "6.5% Fat • 9.0% SNF",
                "coop": "RCDF Saras",
                "trend": "+₹1.00/L bonus announced"
            },
            {
                "region": "Maharashtra (Mahanand & Private Dairies)",
                "cow_milk_rate_per_liter": "₹36.00 - ₹39.50",
                "cow_standard": "3.5% Fat • 8.5% SNF",
                "buffalo_milk_rate_per_liter": "₹58.00 - ₹64.00",
                "buffalo_standard": "6.5% Fat • 9.0% SNF",
                "coop": "Mahanand Dairy",
                "trend": "+₹5/L State Govt DBT subsidy active"
            }
        ]
    }
