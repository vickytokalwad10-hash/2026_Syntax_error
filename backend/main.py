import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from seed import seed_test_accounts

from routers import (
    overview,
    heatmap,
    what_if,
    markets,
    trends,
    alerts,
    copilot,
    crop_health,
    direct_trade,
    weather,
    auth,
    chatbot,
    payment
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: seed the 2 test accounts into in-memory DB
    await seed_test_accounts()
    yield
    # Shutdown: nothing to clean up

app = FastAPI(
    title="AgriPulse AI Backend",
    description="AI-Powered Global Crop Price Prediction & Agricultural Decision-Support Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers for all core modules
app.include_router(overview.router)
app.include_router(heatmap.router)
app.include_router(what_if.router)
app.include_router(markets.router)
app.include_router(trends.router)
app.include_router(alerts.router)
app.include_router(copilot.router)
app.include_router(crop_health.router)
app.include_router(direct_trade.router)
app.include_router(weather.router)
app.include_router(auth.router)
app.include_router(chatbot.router)
app.include_router(payment.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgriPulse AI Core Engine",
        "timestamp": datetime.now().isoformat(),
        "routes": [
            "/api/overview",
            "/api/heatmap",
            "/api/what-if",
            "/api/markets",
            "/api/trends",
            "/api/alerts",
            "/api/copilot",
            "/api/crop-health",
            "/api/direct-trade",
            "/api/weather",
            "/api/auth",
            "/api/chatbot",
            "/api/payment"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
