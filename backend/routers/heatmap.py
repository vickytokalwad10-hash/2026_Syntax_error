from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api/heatmap", tags=["Heatmap & Remote Sensing"])

STATE_REMOTE_SENSING_DATA = [
    {
        "state_id": "PB",
        "state_name": "Punjab",
        "lat": 31.1471,
        "lng": 75.3412,
        "primary_crops": ["Wheat", "Paddy", "Cotton", "Mustard"],
        "mean_ndvi": 0.74,
        "ndvi_status": "Vigorous Green",
        "evi": 0.62,
        "soil_moisture_pct": 68.4,
        "surface_temp_c": 28.6,
        "yield_anomaly_pct": 4.8,
        "remote_sensing_grade": "A+",
        "satellite_source": "Sentinel-2 & Landsat-9 OLI-2",
        "coverage_area_sq_km": 50362,
        "major_districts": [
            {"name": "Ludhiana", "ndvi": 0.78, "soil_moisture": 71.0, "status": "Optimal"},
            {"name": "Bhatinda", "ndvi": 0.69, "soil_moisture": 64.2, "status": "Moderate"},
            {"name": "Amritsar", "ndvi": 0.76, "soil_moisture": 69.5, "status": "Optimal"},
            {"name": "Patiala", "ndvi": 0.75, "soil_moisture": 68.0, "status": "Optimal"}
        ]
    },
    {
        "state_id": "HR",
        "state_name": "Haryana",
        "lat": 29.0588,
        "lng": 76.0856,
        "primary_crops": ["Wheat", "Mustard", "Sugarcane", "Paddy"],
        "mean_ndvi": 0.71,
        "ndvi_status": "High Biomass",
        "evi": 0.58,
        "soil_moisture_pct": 64.1,
        "surface_temp_c": 29.4,
        "yield_anomaly_pct": 3.2,
        "remote_sensing_grade": "A",
        "satellite_source": "Sentinel-2 & MODIS Terra",
        "coverage_area_sq_km": 44212,
        "major_districts": [
            {"name": "Karnal", "ndvi": 0.75, "soil_moisture": 68.2, "status": "Optimal"},
            {"name": "Hisar", "ndvi": 0.67, "soil_moisture": 60.1, "status": "Slight Moisture Stress"},
            {"name": "Sirsa", "ndvi": 0.70, "soil_moisture": 63.8, "status": "Good"}
        ]
    },
    {
        "state_id": "UP",
        "state_name": "Uttar Pradesh",
        "lat": 26.8467,
        "lng": 80.9462,
        "primary_crops": ["Wheat", "Sugarcane", "Potato", "Paddy", "Maize"],
        "mean_ndvi": 0.68,
        "ndvi_status": "Healthy Canopy",
        "evi": 0.54,
        "soil_moisture_pct": 62.8,
        "surface_temp_c": 31.2,
        "yield_anomaly_pct": 1.9,
        "remote_sensing_grade": "B+",
        "satellite_source": "Sentinel-2 Multi-Spectral",
        "coverage_area_sq_km": 240928,
        "major_districts": [
            {"name": "Meerut", "ndvi": 0.72, "soil_moisture": 66.0, "status": "Optimal"},
            {"name": "Varanasi", "ndvi": 0.64, "soil_moisture": 59.4, "status": "Moderate"},
            {"name": "Agra", "ndvi": 0.62, "soil_moisture": 57.1, "status": "Mild Stress"},
            {"name": "Bareilly", "ndvi": 0.70, "soil_moisture": 65.2, "status": "Good"}
        ]
    },
    {
        "state_id": "MP",
        "state_name": "Madhya Pradesh",
        "lat": 22.9734,
        "lng": 78.6569,
        "primary_crops": ["Soybean", "Wheat", "Gram", "Mustard", "Garlic"],
        "mean_ndvi": 0.65,
        "ndvi_status": "Moderate-High Density",
        "evi": 0.51,
        "soil_moisture_pct": 58.6,
        "surface_temp_c": 32.8,
        "yield_anomaly_pct": -0.8,
        "remote_sensing_grade": "B",
        "satellite_source": "Sentinel-2 MSI",
        "coverage_area_sq_km": 308252,
        "major_districts": [
            {"name": "Indore", "ndvi": 0.68, "soil_moisture": 61.2, "status": "Good"},
            {"name": "Ujjain", "ndvi": 0.66, "soil_moisture": 59.0, "status": "Good"},
            {"name": "Sehore", "ndvi": 0.63, "soil_moisture": 56.4, "status": "Moderate Stress"}
        ]
    },
    {
        "state_id": "MH",
        "state_name": "Maharashtra",
        "lat": 19.7515,
        "lng": 75.7139,
        "primary_crops": ["Cotton", "Sugarcane", "Soybean", "Onion", "Tur"],
        "mean_ndvi": 0.61,
        "ndvi_status": "Moderate Vegetative",
        "evi": 0.47,
        "soil_moisture_pct": 52.4,
        "surface_temp_c": 34.1,
        "yield_anomaly_pct": -2.4,
        "remote_sensing_grade": "B-",
        "satellite_source": "Sentinel-2 & Sentinel-1 SAR",
        "coverage_area_sq_km": 307713,
        "major_districts": [
            {"name": "Nashik", "ndvi": 0.66, "soil_moisture": 58.2, "status": "Good (Onion/Grape)"},
            {"name": "Nagpur", "ndvi": 0.59, "soil_moisture": 49.0, "status": "Dry Pocket"},
            {"name": "Kolhapur", "ndvi": 0.72, "soil_moisture": 67.5, "status": "High (Cane Zone)"},
            {"name": "Aurangabad", "ndvi": 0.58, "soil_moisture": 48.6, "status": "Moisture Deficit"}
        ]
    },
    {
        "state_id": "GJ",
        "state_name": "Gujarat",
        "lat": 22.2587,
        "lng": 71.1924,
        "primary_crops": ["Cotton", "Groundnut", "Castor", "Cumin", "Wheat"],
        "mean_ndvi": 0.59,
        "ndvi_status": "Semi-Arid Resilient",
        "evi": 0.44,
        "soil_moisture_pct": 49.8,
        "surface_temp_c": 35.2,
        "yield_anomaly_pct": 1.2,
        "remote_sensing_grade": "B",
        "satellite_source": "Landsat-9 & Sentinel-2",
        "coverage_area_sq_km": 196024,
        "major_districts": [
            {"name": "Rajkot", "ndvi": 0.62, "soil_moisture": 51.5, "status": "Moderate"},
            {"name": "Surat", "ndvi": 0.69, "soil_moisture": 63.4, "status": "Healthy"},
            {"name": "Unjha / Mehsana", "ndvi": 0.57, "soil_moisture": 46.2, "status": "Spice Belt Normal"}
        ]
    },
    {
        "state_id": "RJ",
        "state_name": "Rajasthan",
        "lat": 27.0238,
        "lng": 74.2179,
        "primary_crops": ["Mustard", "Bajra", "Guar", "Gram", "Coriander"],
        "mean_ndvi": 0.54,
        "ndvi_status": "Arid Canopy",
        "evi": 0.39,
        "soil_moisture_pct": 42.1,
        "surface_temp_c": 36.8,
        "yield_anomaly_pct": 0.5,
        "remote_sensing_grade": "C+",
        "satellite_source": "Sentinel-2 MSI",
        "coverage_area_sq_km": 342239,
        "major_districts": [
            {"name": "Sri Ganganagar", "ndvi": 0.71, "soil_moisture": 62.0, "status": "Canal Irrigated Green"},
            {"name": "Kota", "ndvi": 0.64, "soil_moisture": 55.4, "status": "Good"},
            {"name": "Jaipur", "ndvi": 0.52, "soil_moisture": 41.2, "status": "Dry"}
        ]
    },
    {
        "state_id": "AP",
        "state_name": "Andhra Pradesh",
        "lat": 15.9129,
        "lng": 79.7400,
        "primary_crops": ["Paddy", "Chilli", "Tobacco", "Maize", "Cotton"],
        "mean_ndvi": 0.67,
        "ndvi_status": "Coastal Fertile",
        "evi": 0.53,
        "soil_moisture_pct": 63.2,
        "surface_temp_c": 31.8,
        "yield_anomaly_pct": 3.7,
        "remote_sensing_grade": "A-",
        "satellite_source": "Sentinel-2 & Oceansat-3",
        "coverage_area_sq_km": 162968,
        "major_districts": [
            {"name": "Guntur", "ndvi": 0.69, "soil_moisture": 64.5, "status": "Optimal (Chilli/Cotton)"},
            {"name": "East Godavari", "ndvi": 0.74, "soil_moisture": 72.0, "status": "Paddy Dense"},
            {"name": "Kurnool", "ndvi": 0.58, "soil_moisture": 51.0, "status": "Semi-Arid"}
        ]
    },
    {
        "state_id": "KA",
        "state_name": "Karnataka",
        "lat": 15.3173,
        "lng": 75.7139,
        "primary_crops": ["Maize", "Sugarcane", "Ragi", "Cotton", "Sunflower"],
        "mean_ndvi": 0.63,
        "ndvi_status": "Moderate Biomass",
        "evi": 0.49,
        "soil_moisture_pct": 55.3,
        "surface_temp_c": 30.5,
        "yield_anomaly_pct": 1.1,
        "remote_sensing_grade": "B",
        "satellite_source": "Sentinel-2 MSI",
        "coverage_area_sq_km": 191791,
        "major_districts": [
            {"name": "Dharwad", "ndvi": 0.64, "soil_moisture": 56.0, "status": "Normal"},
            {"name": "Belagavi", "ndvi": 0.70, "soil_moisture": 66.2, "status": "Cane High"},
            {"name": "Ballari", "ndvi": 0.56, "soil_moisture": 47.8, "status": "Dry"}
        ]
    },
    {
        "state_id": "WB",
        "state_name": "West Bengal",
        "lat": 22.9868,
        "lng": 87.8550,
        "primary_crops": ["Paddy (Aman/Boro)", "Jute", "Potato", "Tea"],
        "mean_ndvi": 0.73,
        "ndvi_status": "Vigorous Green",
        "evi": 0.60,
        "soil_moisture_pct": 74.2,
        "surface_temp_c": 29.1,
        "yield_anomaly_pct": 5.1,
        "remote_sensing_grade": "A+",
        "satellite_source": "Sentinel-2 MSI",
        "coverage_area_sq_km": 88752,
        "major_districts": [
            {"name": "Burdwan", "ndvi": 0.77, "soil_moisture": 76.5, "status": "Rice Bowl High"},
            {"name": "Hooghly", "ndvi": 0.74, "soil_moisture": 73.0, "status": "Potato Optimal"},
            {"name": "Murshidabad", "ndvi": 0.71, "soil_moisture": 71.2, "status": "Good"}
        ]
    }
]

@router.get("")
def get_heatmap_data():
    return {
        "status": "success",
        "satellite_constellation": "Copernicus Sentinel-2A/B & NASA/USGS Landsat-9",
        "resolution_meters": 10,
        "revisit_frequency_days": 5,
        "cloud_coverage_threshold_pct": 12.0,
        "spectral_layers": [
            {"code": "NDVI", "name": "Normalized Difference Vegetation Index", "formula": "(NIR - RED) / (NIR + RED)", "range": "0.0 to 1.0"},
            {"code": "EVI", "name": "Enhanced Vegetation Index", "formula": "2.5 * ((NIR - RED) / (NIR + 6*RED - 7.5*BLUE + 1))", "range": "0.0 to 1.0"},
            {"code": "NDWI", "name": "Normalized Difference Water Index", "formula": "(NIR - SWIR) / (NIR + SWIR)", "range": "-1.0 to 1.0"},
            {"code": "SMAP", "name": "Topsoil Moisture (0-5cm Depth)", "unit": "Volumetric %", "range": "0% to 100%"}
        ],
        "states": STATE_REMOTE_SENSING_DATA,
        "summary": {
            "highest_ndvi_state": "Punjab (0.74)",
            "highest_soil_moisture": "West Bengal (74.2%)",
            "lowest_moisture_alert": "Rajasthan (42.1%) & Marathwada/Vidarbha MH (48.6%)",
            "national_canopy_health": "Above 5-year average (+3.4%)"
        }
    }
