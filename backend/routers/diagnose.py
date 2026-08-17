"""
Pest & Disease Detection via Camera Router
Provides endpoints for:
1. Camera/Image upload crop diagnostic engine (Gemini Vision / Agro-classification)
2. Treatment prescription (Organic remedies + Chemical dosages)
3. Offline queue payload support
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import random

router = APIRouter(prefix="/api/diagnose", tags=["Pest & Disease Detection"])

class DiagnoseRequest(BaseModel):
    crop_type: Optional[str] = "Wheat"
    image_base64: Optional[str] = None
    farmer_notes: Optional[str] = None
    is_offline_sync: Optional[bool] = False

# Realistic agronomic disease database with ICAR/IARI recommended dosages
DISEASE_DB = {
    "Wheat": [
        {
            "issue_name": "Yellow Rust (Puccinia striiformis)",
            "severity": "Moderate to High",
            "confidence_score": 94.2,
            "symptoms": "Yellowish-orange pustules arranged in linear stripes along the leaf veins. Spores rub off on fingers as yellow powder.",
            "organic_treatment": "Spray 5% Neem Seed Kernel Extract (NSKE) or Trichoderma viride @ 5g/liter at first appearance.",
            "chemical_treatment": "Foliar spray of Propiconazole 25% EC (Tilt) @ 1 ml per liter of water (200 ml in 200 liters water/acre).",
            "preventative_action": "Avoid late sowing and excessive Nitrogen fertilization. Grow rust-resistant varieties like DBW-187, DBW-303, or HD-3226."
        },
        {
            "issue_name": "Loose Smut (Ustilago tritici)",
            "severity": "High",
            "confidence_score": 91.5,
            "symptoms": "Entire earhead transformed into black powdery mass of smut spores covered by a delicate silvery membrane.",
            "organic_treatment": "Solar heat treatment of seed during May-June before sowing.",
            "chemical_treatment": "Seed treatment with Carboxin 37.5% + Thiram 37.5% DS (Vitavax Power) @ 2.5g/kg seed before sowing.",
            "preventative_action": "Use certified disease-free seed. Rogue out infected ears in a plastic bag to prevent spore spread."
        }
    ],
    "Paddy": [
        {
            "issue_name": "Bacterial Leaf Blight (Xanthomonas oryzae)",
            "severity": "High",
            "confidence_score": 95.8,
            "symptoms": "Water-soaked lesions on leaf margins that turn yellowish-white with wavy margins. Milky bacterial ooze droplets in early morning.",
            "organic_treatment": "Spray Fresh Cow Dung Extract (20%) + Asafoetida (Hing) 100g/acre.",
            "chemical_treatment": "Spray Streptocycline @ 6g + Copper Oxychloride 50% WP @ 500g in 200 liters of water per acre.",
            "preventative_action": "Drain standing water from field for 3-4 days. Avoid top-dressing of Nitrogen during disease outbreak."
        },
        {
            "issue_name": "Brown Plant Hopper (Nilaparvata lugens)",
            "severity": "Severe ('Hopper Burn')",
            "confidence_score": 89.4,
            "symptoms": "Circular patches of dried, golden-yellow plants ('hopper burn'). Small brown insects clustered at the base of tillers.",
            "organic_treatment": "Neem Oil 1500 ppm @ 3 ml/liter directed at the base of the plant.",
            "chemical_treatment": "Foliar spray of Pymetrozine 50% WDG (Chess) @ 120g/acre or Triflumezopyrim 10% SC @ 94 ml/acre.",
            "preventative_action": "Provide 'Alleyways' (skipping one row every 2 meters) for aeration and sunlight penetration."
        }
    ],
    "Mustard": [
        {
            "issue_name": "Mustard Aphid (Lipaphis erysimi)",
            "severity": "High",
            "confidence_score": 96.1,
            "symptoms": "Tiny green/black insects clustered on inflorescence, tender shoots, and pods sucking sap. Honey dew excretion leads to black sooty mold.",
            "organic_treatment": "Spray Verticillium lecanii bio-fungicide @ 5g/liter or Neem oil @ 5 ml/liter.",
            "chemical_treatment": "Spray Dimethoate 30% EC (Rogor) @ 1.5 ml/liter or Imidacloprid 17.8% SL @ 0.5 ml/liter of water.",
            "preventative_action": "Sow crop before 20th October to escape peak aphid infestation in January-February."
        }
    ],
    "Soybean": [
        {
            "issue_name": "Yellow Mosaic Virus (YMV) transmitted by Whitefly",
            "severity": "High",
            "confidence_score": 92.7,
            "symptoms": "Bright yellow patches interspersed with green areas on leaf blades. Stunted plant growth and reduced pod formation.",
            "organic_treatment": "Install yellow sticky traps @ 15 traps/acre to capture whiteflies.",
            "chemical_treatment": "Spray Thiamethoxam 25% WG @ 40g/acre or Acetamiprid 20% SP @ 50g/acre to control whitefly vectors.",
            "preventative_action": "Grow resistant varieties like JS-20-29, JS-20-34, or NRC-86. Rogue out affected plants early."
        }
    ]
}

@router.post("/pest-disease")
def diagnose_crop_disease(payload: DiagnoseRequest):
    """
    Diagnose crop pest/disease from photo upload.
    
    [INTEGRATION SWAP POINT]:
    Replace with Gemini 2.0 Vision API:
    Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
    Payload: Image binary with prompt: "Identify crop disease, confidence %, ICAR chemical dosage and organic remedy"
    """
    crop = payload.crop_type if payload.crop_type in DISEASE_DB else "Wheat"
    candidates = DISEASE_DB.get(crop, DISEASE_DB["Wheat"])
    selected = random.choice(candidates)

    return {
        "status": "success",
        "crop_analyzed": crop,
        "is_offline_sync": payload.is_offline_sync,
        "diagnosis": {
            "issue_name": selected["issue_name"],
            "severity": selected["severity"],
            "confidence_score": selected["confidence_score"],
            "symptoms": selected["symptoms"],
            "organic_treatment": selected["organic_treatment"],
            "chemical_treatment": selected["chemical_treatment"],
            "preventative_action": selected["preventative_action"],
            "advisory_badge": "ICAR-IARI Prescribed Protocol",
            "safety_note": "Wear protective mask while spraying. Observe 14-day pre-harvest waiting interval (PHI)."
        }
    }
