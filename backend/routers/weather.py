from fastapi import APIRouter, Query
from typing import Dict, Any, List
from services.weather_service import get_hub_weather_profile, get_all_regional_hubs_summary, AGRI_HUBS

router = APIRouter(prefix="/api/weather", tags=["Live Agricultural Weather & Microclimate"])

@router.get("/current")
def get_current_weather(hub: str = Query("ludhiana", description="Agri hub ID")):
    return get_hub_weather_profile(hub_key=hub, days=1)

@router.get("/forecast")
def get_weather_forecast(hub: str = Query("ludhiana", description="Agri hub ID"), days: int = Query(7, ge=1, le=14)):
    return get_hub_weather_profile(hub_key=hub, days=days)

@router.get("/regional-hubs")
def get_regional_hubs():
    return {
        "status": "success",
        "total_hubs": len(AGRI_HUBS),
        "hubs": get_all_regional_hubs_summary()
    }

@router.get("/agri-advisory")
def get_agri_advisory(crop: str = Query("wheat"), hub: str = Query("ludhiana")):
    profile = get_hub_weather_profile(hub_key=hub, days=7)
    curr = profile["current_weather"]
    indices = profile["agronomy_indices"]
    forecast = profile["daily_forecast"]

    rain_expected = any(f["rain_mm"] > 5.0 for f in forecast[:3])
    high_heat = curr["temperature"] >= 36.0

    if high_heat:
        advisory_en = f"High thermal stress warning for {crop.title()} in {profile['hub_name']}. Soil evapotranspiration is elevated at {curr['evapotranspiration_et0']} mm/day. Schedule light evening micro-irrigation and foliar spray of Potassium Nitrate."
        advisory_hi = f"{profile['hub_name']} में {crop} की फसल के लिए अत्यधिक तापमान की चेतावनी। वाष्पीकरण दर {curr['evapotranspiration_et0']} मिमी/दिन है। शाम के समय हल्की सिंचाई और पोटेशियम नाइट्रेट का छिड़काव करें।"
    elif rain_expected:
        advisory_en = f"Precipitation expected in {profile['hub_name']} within next 72h. Halt pesticide spraying and chemical fertilizer broadcast. Ensure field drainage channels are unobstructed."
        advisory_hi = f"अगले 72 घंटों में {profile['hub_name']} में बारिश की संभावना। कीटनाशक छिड़काव व यूरिया का छिड़काव रोकें। जल निकासी की व्यवस्था दुरुस्त रखें।"
    else:
        advisory_en = f"Favorable weather window for {crop.title()} in {profile['hub_name']}. Ambient wind ({curr['wind_speed_kmh']} km/h) and moisture ({curr['soil_moisture_pct']}%) are ideal for nutrient uptake and scheduled fieldwork."
        advisory_hi = f"{profile['hub_name']} में {crop} के लिए मौसम अनुकूल है। हवा की गति ({curr['wind_speed_kmh']} किमी/घंटा) और मिट्टी में नमी ({curr['soil_moisture_pct']}%) कृषि कार्यों के लिए उपयुक्त हैं।"

    return {
        "status": "success",
        "crop": crop,
        "hub": profile["hub_name"],
        "advisory_en": advisory_en,
        "advisory_hi": advisory_hi,
        "spraying_suitability": indices["spraying_suitability"],
        "harvesting_window": indices["harvesting_window"],
        "irrigation_recommendation": indices["irrigation_recommendation"]
    }
