# 🌾 AgriPulse AI — Agricultural Intelligence & Direct Trading Platform (v2.1.0)

[![Version](https://img.shields.io/badge/Version-2.1.0%20Pro-14532D?style=for-the-badge)](https://github.com/vickytokalwad10-hash/2026_Syntax_error)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.13-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Database%20%26%20Auth-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Android](https://img.shields.io/badge/Mobile-Native%20Android%20APK-3DDC84?logo=android&logoColor=white)](https://developer.android.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**AgriPulse AI** is a comprehensive agricultural decision-support, B2B trading floor, and farmer-first fintech ecosystem. Built with a human-crafted design system tailored for Indian agricultural realities, it bridges farmers, FPOs, and institutional buyers through transparent market discovery, government scheme access, and bank-backed smart escrow.

---

## 🌟 Key Platform Capabilities

### 🌾 1. Core Mandi Intelligence & Trading
- **Mandi Spot Radar**: Real-time modal price feeds, arrivals in MT, and official government **e-NAM benchmark integration**.
- **Crop Planning AI**: Agro-climatic profit optimizer predicting optimal next-season crop combinations based on soil, monsoon forecasts, and mandi futures.
- **Buyer Trust Shield**: 100-point KYC, GST verification, and default risk audit on institutional commodity buyers.
- **Direct B2B Trading Floor**: Farmgate listing exchange with NABL quality assay certification and zero middleman brokerage.
- **Multilingual Kisan Mitra (Voice AI)**: Voice copilot supporting Hindi, Punjabi, Marathi, Gujarati, and Indian English with ICAR agronomy recommendations.

### 🏛️ 2. Schemes & Farmer Fintech
- **Govt Schemes & Subsidies**: PM-KISAN 18-installment tracker, PMFBY crop loss claim workflow, and Soil Health Card NPK analyzer.
- **KCC Credit Estimator**: Subsidized 4% Kisan Credit Card loan calculator aligned with NABARD District Scale of Finance.
- **Payment & Smart Escrow Vault**: Multi-rail payments (Razorpay sandbox, UPI QR intent with `agripulse.escrow@icici`, and 100% advance deposit escrow with mandatory 2FA OTP for high-value orders $\ge$ ₹50,000).

### 🚜 3. Farm Operations & Offline Resilience
- **Camera Crop Doctor**: Instant pest/disease recognition with ICAR-approved chemical and bio-control prescriptions.
- **Smart Irrigation & IoT Telemetry**: Critical growth-stage irrigation calendar paired with real-time topsoil moisture sensors.
- **Farm Machinery & Labor Sharing**: Tractor/harvester rental exchange and seasonal farm labor availability board.
- **Dynamic Crop Almanac**: Sowing-to-harvest milestone tracking with browser push notifications.
- **Offline-First Resilience**: Dexie.js IndexedDB storage ensuring 100% functionality without internet in rural fields.

---

## 🏗️ Architecture & Tech Stack

```
agripulse-ai/
├── backend/                  # FastAPI 0.141+ Python Backend
│   ├── database.py           # Supabase PostgreSQL + Resilient Fallback Layer
│   ├── main.py               # API Entrypoint & Lifespan Hooks
│   ├── models.py             # Pydantic Schemas & Data Contracts
│   ├── requirements.txt      # Python Dependencies
│   └── routers/              # 15+ Specialized Service Routers
│       ├── crop_planning.py  ├── schemes.py         ├── payment.py
│       ├── fraud_detection.py├── finance.py         ├── community.py
│       ├── diagnose.py       ├── irrigation.py      ├── livestock.py
│       ├── rentals.py        ├── calendar.py        └── enam.py
├── frontend/                 # React 19 + Vite Frontend & Capacitor
│   ├── src/
│   │   ├── components/       # Layouts, Navigation & Shared Components
│   │   ├── context/          # AuthContext (Supabase) & NetworkContext (Offline)
│   │   ├── pages/            # 16 Full-Featured Application Screens
│   │   └── services/         # Supabase Client & Dexie Offline DB
│   └── android/              # Native Capacitor Android Project (Gradle)
└── scripts/
    └── build_apk.py          # Automated APK Build & Packaging Script
```

---

## 🚀 Quick Setup & Local Run

### 1. Prerequisites
- **Node.js 18+** & `npm`
- **Python 3.10+**
- **Android SDK & OpenJDK 21** (for building Android APK)

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
python main.py
```
*Backend runs at `http://127.0.0.1:8000` (Swagger docs at `/docs`)*

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
*Frontend runs at `http://127.0.0.1:5173`*

---

## 📱 Compiling Native Android APK

To build and package the native Android APK (`v2.1.0`):
```bash
# From repository root
python scripts/build_apk.py

# Or from frontend directory
cd frontend
npm run build:apk
```

---

## 🏛️ e-NAM & Government Mandi Integration Roadmap

AgriPulse AI integrates official daily mandi spot and modal price intelligence using a Two-Tier Architecture:

### Tier 1 (Active in Production): Open Government Data (data.gov.in)
- **Agmarknet Daily Spot Dataset**: Automated queries to `data.gov.in` (`resource_id: 9ef84268-d588-465a-a308-a864a43d0070`).
- **Multi-Tier Cache**: In-memory + disk JSON cache with 4-hour TTL preventing upstream government rate-limits.
- **NDSAP Compliance**: Mandatory attribution displayed across all price surfaces.
- **Dynamic Coverage**: Evaluates `"X mandis reporting for [commodity] in [state]"` from live telemetry.

### Tier 2 (Enterprise Empanelment Pathway): Official e-NAM Service Provider
- Direct write access, live trade bidding auctions, gate inward weighbridge telemetry, and e-NWR warehouse receipts require institutional empanelment with **SFAC (Small Farmers Agribusiness Consortium)** under the Ministry of Agriculture & Farmers' Welfare.
- Reference RFQ: *"Empanelment of Service Providers for integration with National Agriculture Market (e-NAM)"* (published on `enam.gov.in/web/resources/tenders`).
- For technical interface specifications, see [`docs/enam_integration_roadmap.md`](docs/enam_integration_roadmap.md).

---

## 🔑 Authentication Sandbox Credentials

- **Farmer Role**: `farmer@agripulse.ai` / `Farmer@123`
- **Buyer Role**: `buyer@agripulse.ai` / `Buyer@123`
- **Magic OTP PIN**: `123456`

---

## 📄 License
Released under the [MIT License](LICENSE).
