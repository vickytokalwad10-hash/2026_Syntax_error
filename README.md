# 🌾 AgriPulse AI — Global Crop Price Prediction & Agricultural Decision-Support Platform

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.13-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Leaflet](https://img.shields.io/badge/Remote%20Sensing-Google%20Satellite%20%2B%20Leaflet-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Chart.js](https://img.shields.io/badge/Visualization-Chart.js-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**AgriPulse AI** is an advanced agritech and commodity market intelligence platform engineered to empower **Farmers**, **Agricultural Cooperatives (FPOs)**, and **Institutional Buyers / Millers / Exporters** with real-time price forecasting, satellite canopy health tracking, mandi arbitrage optimization, and direct B2B escrow trade.

---

## 🌟 Key Platform Modules

### 1. 🤖 AI Voice & Text Copilot (English & हिंदी)
- Dual-role reasoning engine tailored for **Farmers** and **Institutional Buyers**.
- Answers complex queries regarding **15 & 30-Day Forward Price Projections**, **WDRA Storage ROI vs Sell Now**, **Statutory MSP Norms & Moisture Limits**, **Zero-Brokerage Direct Selling**, and **Quality Fair Average Quality (FAQ) Specs**.
- Integrated Web Speech API audio synthesis for natural Indian English and Hindi voice readouts.

### 2. 🤝 Direct B2B Farmgate Marketplace & Escrow Portal
- **Farmer Portal**: List harvested commodities directly with quality assay specs and 0% brokerage commission.
- **Buyer Portal**: Source 500+ MT bulk aggregated lots directly from verified FPOs with digital weighbridge verification and 100% bank-backed escrow safety.
- **Interactive Margin Calculator**: Real-time comparison between APMC mandi deductions vs. direct farmgate margins.

### 3. 📈 Multi-Commodity Price Forecasting Curves (`/trends` & `/overview`)
- 30-day forward price trajectories with confidence bands and historical regression across 10 tracked crops:
  - *Wheat (शरबती), Paddy/Rice (बासमती), Cotton (शंकर-6), Soybean (पीला), Mustard (सरसों), Onion (नासिक), Tomato (हाइब्रिड), Potato (कुफरी), Sugarcane (गन्ना), Maize (मक्का)*.

### 4. 🌤️ Live Weather & Agricultural Microclimate Radar (`/weather`)
- Live meteorological observations synced with OpenWeatherMap and Open-Meteo high-resolution feeds.
- Calculates agronomic indices: **Root Zone Soil Moisture (0-7cm)**, **Evapotranspiration ($ET_0$)**, **Thermal Heatwave Stress**, **Pesticide Spraying Suitability Window**, and **Harvesting Window Dry Index**.

### 5. 🗺️ Satellite Remote Sensing Heatmap (`/heatmap`)
- Google Satellite View + Copernicus Sentinel-2 MSI Multi-Spectral Vegetation Indices (**NDVI**, **EVI**, **Soil Moisture %**).
- State-wise vegetative health monitoring across all major Indian agricultural zones.

### 6. ⚖️ Mandi Profit Arbitrage & Storage ROI Matrix (`/markets`)
- APMC mandi optimizer calculating highest net realization after transit and freight deductions.
- **Sell Now vs. 60-Day WDRA Warehouse Storage Matrix** incorporating e-NWR 7% pledge financing.

### 7. 🧪 What-If Scenario Simulator (`/what-if`)
- Simulate macro shocks: yield fluctuations, export demand surges, diesel freight shifts, and unseasonal weather anomalies.

### 8. 🌱 Sentinel-2 Canopy Health & Thermal Anomaly Radar (`/crop-health`)
- 10-meter spatial resolution spectral analysis, chlorophyll absorption, and night irrigation alerts.

---

## 🎨 Design & Palette
Designed with a curated agritech dark aesthetic:
- **Dark Forest Green**: `#0A3323`
- **Moss Green**: `#839958`
- **Warm Beige**: `#F7F4D5`
- **Rosy Brown**: `#D3968C`
- **Midnight Green**: `#105666`

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`

### 1. Clone the Repository
```bash
git clone https://github.com/vickytokalwad10-hash/2026_Syntax_error.git
cd 2026_Syntax_error
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
> Backend runs at `http://127.0.0.1:8000` (Swagger UI at `/docs`).

### 3. Frontend Setup (React + Vite)
```bash
cd ../frontend
npm install
npm run dev
```
> Frontend runs at `http://127.0.0.1:5173`.

---

## 📁 Project Architecture

```
2026_Syntax_error/
├── backend/
│   ├── main.py                  # FastAPI root application & CORS configuration
│   ├── requirements.txt         # Python dependencies (fastapi, uvicorn, pydantic)
│   ├── services/
│   │   └── weather_service.py   # Live OpenWeather & agro-meteorology calculation engine
│   └── routers/
│       ├── overview.py          # Summary snapshot & 15-day price projections
│       ├── direct_trade.py      # B2B direct farmer/buyer marketplace & escrow contracts
│       ├── weather.py           # Real-time agro-weather & microclimate radar
│       ├── heatmap.py           # India satellite NDVI vegetation indices
│       ├── markets.py           # APMC mandi profit optimizer & WDRA storage ROI
│       ├── trends.py            # 30-day commodity price forecast curves
│       ├── alerts.py            # Anomaly, volatility & weather alert feed
│       ├── copilot.py           # Multi-intent multilingual AI Copilot engine
│       ├── crop_health.py       # Sentinel-2 multispectral canopy health
│       └── what_if.py           # Macroeconomic & climate scenario simulator
│
└── frontend/
    ├── package.json             # React 19, Vite, Chart.js, Lucide, Leaflet
    ├── vite.config.js
    └── src/
        ├── App.jsx              # Application router & language context
        ├── index.css            # Dark mode design system & tokens
        ├── components/
        │   ├── AppLayout.jsx    # Topbar + responsive sidebar layout
        │   ├── Sidebar.jsx      # Navigation sidebar with status badges
        │   ├── Header.jsx       # Global header with language toggle
        │   └── MetricCard.jsx   # Microclimate & market KPI card component
        ├── pages/
        │   ├── OverviewView.jsx
        │   ├── DirectMarketView.jsx
        │   ├── WeatherView.jsx
        │   ├── HeatmapView.jsx
        │   ├── MarketsView.jsx
        │   ├── TrendsView.jsx
        │   ├── AlertsView.jsx
        │   ├── CopilotView.jsx
        │   ├── CropHealthView.jsx
        │   └── WhatIfView.jsx
        └── services/
            └── api.js           # Client API connector with offline fallbacks
```

---

## 📜 License
Distributed under the MIT License. Built for farmers and agricultural trade modernization.
