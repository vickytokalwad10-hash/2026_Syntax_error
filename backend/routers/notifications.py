from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from services.notification_service import (
    notification_service,
    NotificationItem,
    NotificationSettings
)

router = APIRouter(prefix="/api/notifications", tags=["Notifications & Auto-Alerts"])

class MarkReadResponse(BaseModel):
    success: bool
    marked_id: Optional[str] = None
    marked_count: int = 0
    unread_count: int

class TriggerSimulationRequest(BaseModel):
    user_id: str = "default_farmer"
    trigger_type: str  # "weather", "price", "scheme", "escrow"
    rain_probability: Optional[int] = 85
    severe_flag: Optional[str] = None
    crop: Optional[str] = "wheat"
    price_change_pct: Optional[float] = 6.2
    current_price: Optional[float] = 2880.0
    scheme_name: Optional[str] = "PM-KISAN"

@router.get("", response_model=Dict[str, Any])
def get_notifications(
    user_id: str = Query("default_farmer", description="User ID"),
    category: Optional[str] = Query(None, description="Optional category filter")
):
    """
    Fetch all notifications for user, newest-first, with unread badge count
    and breakdown summary.
    """
    all_notifs = notification_service.get_user_notifications(user_id)
    
    if category and category != "all":
        filtered = [n for n in all_notifs if n.category.lower() == category.lower()]
    else:
        filtered = all_notifs

    unread_count = sum(1 for n in all_notifs if n.unread)
    
    return {
        "status": "success",
        "user_id": user_id,
        "unread_count": unread_count,
        "total_count": len(all_notifs),
        "notifications": [n.model_dump() for n in filtered],
        "category_counts": {
            "all": len(all_notifs),
            "weather": sum(1 for n in all_notifs if n.category == "weather"),
            "price": sum(1 for n in all_notifs if n.category == "price"),
            "scheme": sum(1 for n in all_notifs if n.category == "scheme"),
            "marketplace": sum(1 for n in all_notifs if n.category == "marketplace"),
            "system": sum(1 for n in all_notifs if n.category == "system")
        }
    }

@router.post("/mark-read/{notif_id}", response_model=MarkReadResponse)
def mark_notification_read(
    notif_id: str,
    user_id: str = Query("default_farmer", description="User ID")
):
    """Mark a single notification as read."""
    success = notification_service.mark_read(user_id, notif_id)
    all_notifs = notification_service.get_user_notifications(user_id)
    unread_count = sum(1 for n in all_notifs if n.unread)
    
    return MarkReadResponse(
        success=success,
        marked_id=notif_id,
        marked_count=1 if success else 0,
        unread_count=unread_count
    )

@router.post("/mark-all-read", response_model=MarkReadResponse)
def mark_all_notifications_read(
    user_id: str = Query("default_farmer", description="User ID")
):
    """Mark all notifications as read for the user."""
    count = notification_service.mark_all_read(user_id)
    all_notifs = notification_service.get_user_notifications(user_id)
    unread_count = sum(1 for n in all_notifs if n.unread)
    
    return MarkReadResponse(
        success=True,
        marked_count=count,
        unread_count=unread_count
    )

@router.get("/settings", response_model=NotificationSettings)
def get_notification_settings(
    user_id: str = Query("default_farmer", description="User ID")
):
    """Retrieve user alert preferences, thresholds, and crop watchlist."""
    return notification_service.get_user_settings(user_id)

@router.post("/settings", response_model=NotificationSettings)
def update_notification_settings(
    settings: NotificationSettings
):
    """Update user alert preferences, thresholds, and crop watchlist."""
    return notification_service.update_user_settings(settings.user_id, settings)

@router.post("/trigger-simulation")
def trigger_simulation(payload: TriggerSimulationRequest):
    """
    Simulation endpoint to trigger live alerts and verify push / toast pipelines.
    """
    result = None
    if payload.trigger_type == "weather":
        result = notification_service.check_and_trigger_weather_alert(
            user_id=payload.user_id,
            rain_probability=payload.rain_probability or 85,
            severe_flag=payload.severe_flag
        )
    elif payload.trigger_type == "price":
        result = notification_service.check_and_trigger_price_alert(
            user_id=payload.user_id,
            crop=payload.crop or "wheat",
            current_price=payload.current_price or 2880.0,
            price_change_pct=payload.price_change_pct or 6.2
        )
    
    if result:
        return {
            "status": "triggered",
            "notification": result.model_dump()
        }
    else:
        return {
            "status": "suppressed_or_unmet",
            "message": "Notification condition was unmet or suppressed by active cooldown window."
        }
