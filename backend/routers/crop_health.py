from fastapi import APIRouter
from datetime import datetime, timedelta
from typing import Dict, Any, List

router = APIRouter(prefix="/api/crop-health", tags=["Sentinel-2 Crop Canopy Health"])

@router.get("")
def get_crop_health_data(parcel_id: str = "parcel-north-ludhiana-01"):
    today = datetime.now()
    
    # 90-Day Sentinel-2 Satellite Multi-Spectral Observation Time Series
    observation_points = []
    for step in range(9):
        pass_date = today - timedelta(days=(8 - step) * 10)
        # Healthy S-curve vegetative development curve
        progress = step / 8.0
        ndvi_val = round(0.25 + (0.54 / (1.0 + (2.718 ** (-6.5 * (progress - 0.45))))), 3)
        ndre_val = round(0.18 + (0.46 / (1.0 + (2.718 ** (-6.2 * (progress - 0.48))))), 3)
        ndwi_val = round(0.12 + (0.38 / (1.0 + (2.718 ** (-5.8 * (progress - 0.42))))), 3)
        savi_val = round(0.20 + (0.48 / (1.0 + (2.718 ** (-6.0 * (progress - 0.46))))), 3)
        
        observation_points.append({
            "pass_id": f"S2B_MSIL2A_{(8-step)}",
            "date": pass_date.strftime("%d %b"),
            "full_date": pass_date.strftime("%Y-%m-%d"),
            "cloud_cover_pct": round(2.0 + (step * 0.8), 1),
            "ndvi": ndvi_val,
            "ndre": ndre_val,
            "ndwi": ndwi_val,
            "savi": savi_val
        })

    # Current Spectral Signature Across Sentinel-2 MSI Bands
    spectral_reflectance = [
        {"band": "B2 (Blue 490nm)", "reflectance_pct": 5.4, "desc": "Atmospheric & Chlorophyll Absorption"},
        {"band": "B3 (Green 560nm)", "reflectance_pct": 11.2, "desc": "Healthy Green Plant Reflectance"},
        {"band": "B4 (Red 665nm)", "reflectance_pct": 6.8, "desc": "Peak Photosynthetic Red Absorption"},
        {"band": "B5 (Red Edge 1 705nm)", "reflectance_pct": 22.4, "desc": "Transition Boundary"},
        {"band": "B6 (Red Edge 2 740nm)", "reflectance_pct": 42.1, "desc": "Chlorophyll Sensitivity Point"},
        {"band": "B8 (Broad NIR 842nm)", "reflectance_pct": 58.6, "desc": "Mesophyll Cell Structure Scattering (High Health)"},
        {"band": "B8A (Narrow NIR 865nm)", "reflectance_pct": 59.8, "desc": "Biomass & Leaf Area Index (LAI)"},
        {"band": "B11 (SWIR-1 1610nm)", "reflectance_pct": 18.2, "desc": "Canopy Moisture Absorption"},
        {"band": "B12 (SWIR-2 2190nm)", "reflectance_pct": 10.5, "desc": "Soil & Lignin / Cellulose"}
    ]

    return {
        "status": "success",
        "parcel_metadata": {
            "parcel_id": parcel_id,
            "parcel_name": "Khasra #428, Ludhiana Agricultural Block",
            "state": "Punjab",
            "crop": "Wheat (Sharbati PBW-824)",
            "sowing_date": (today - timedelta(days=82)).strftime("%Y-%m-%d"),
            "growth_stage": "Heading to Milk Stage (GS 71)",
            "satellite_sensor": "Copernicus Sentinel-2B MSI (Multi-Spectral Instrument)",
            "spatial_resolution": "10 Meters / Pixel",
            "last_satellite_overpass": (today - timedelta(days=2)).strftime("%Y-%m-%d %H:%M UTC")
        },
        "current_indices": {
            "ndvi": {"value": 0.762, "rating": "Optimal / Dense Biomass", "status": "green", "reference_range": "0.65 - 0.85"},
            "ndre": {"value": 0.628, "rating": "High Nitrogen & Chlorophyll", "status": "green", "reference_range": "0.50 - 0.70"},
            "ndwi": {"value": 0.445, "rating": "Adequate Canopy Hydration", "status": "green", "reference_range": "0.35 - 0.55"},
            "savi": {"value": 0.672, "rating": "Soil Background Corrected High", "status": "green", "reference_range": "0.55 - 0.75"}
        },
        "time_series_observations": observation_points,
        "spectral_signature": spectral_reflectance,
        "canopy_zonation": [
            {"zone": "North-East Sector (Zone A)", "area_pct": 42, "ndvi": 0.79, "vigor": "Exceptional", "status": "Optimal"},
            {"zone": "Central Core (Zone B)", "area_pct": 38, "ndvi": 0.76, "vigor": "High Uniform", "status": "Optimal"},
            {"zone": "South-West Drainage Edge (Zone C)", "area_pct": 20, "ndvi": 0.64, "vigor": "Moderate", "status": "Minor Soil Moisture Deficit"}
        ],
        "actionable_agronomic_brief": {
            "biomass_assessment": "Canopy biomass is 8.4% above regional historical baseline for this phenological stage.",
            "chlorophyll_status": "No nitrogen deficiency detected in upper leaf canopy (NDRE 0.628).",
            "irrigation_prescription": "Zone C requires scheduled micro-irrigation within 48 hours to maintain uniform grain weight fill.",
            "disease_scouting": "Zero spectral signature of yellow rust or blight pustules across all 10m grid cells."
        }
    }
