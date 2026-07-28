import os
import time
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, status
from google import genai

from app.models.ai_settings_model import (
    UserUpdateAISettings, ConnectAPIRequest, PreferredModeRequest, AISettingsResponse
)
from app.services.auth_services import get_current_user
from app.services.ai_provider_service import (
    get_user_ai_settings, encrypt_api_key, decrypt_api_key, mask_api_key,
    MODEL_FALLBACK_CHAIN, save_ai_alert
)
from app.services.email_service import send_email_notification
from app.templates.email_templates import template_security_alert
from app.config.database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai-settings", tags=["ai-settings"])

def verify_and_test_gemini_key(api_key: str) -> Dict[str, Any]:
    """Test key validity, list available models, and measure response latency."""
    client = genai.Client(api_key=api_key)
    
    start_time = time.time()
    
    try:
        # 1. Fetch available models
        models = client.models.list()
        model_names = [m.name.split("/")[-1] for m in models]
        available = [m for m in MODEL_FALLBACK_CHAIN if m in model_names]
        
        if not available:
            # Fallback default models if list is restricted
            available = MODEL_FALLBACK_CHAIN.copy()
            
        # 2. Measure latency with lightweight test call
        test_model = available[0]
        response = client.models.generate_content(
            model=test_model,
            contents="Ping"
        )
        if not response or not response.text:
            raise ValueError("No response received from Gemini model.")
            
        latency = int((time.time() - start_time) * 1000)
        return {
            "status": "online",
            "latency": latency,
            "available_models": available,
            "selected_model": test_model
        }
    except Exception as e:
        logger.error(f"Gemini API verification failed: {e}")
        raise ValueError(f"Key verification failed: {str(e)}")

@router.get("", response_model=AISettingsResponse)
def get_ai_settings(current_user: dict = Depends(get_current_user)):
    """Retrieve logged-in user's AI settings, masking the personal key."""
    settings = get_user_ai_settings(current_user["_id"])
    
    raw_key = decrypt_api_key(settings.get("encrypted_api_key"))
    masked_key = mask_api_key(raw_key) if raw_key else None
    
    return {
        "provider": settings.get("provider", "google-gemini"),
        "preferred_mode": settings.get("preferred_mode", "shared"),
        "selected_model": settings.get("selected_model", "gemini-2.5-flash"),
        "available_models": settings.get("available_models", MODEL_FALLBACK_CHAIN.copy()),
        "status": settings.get("status", "online"),
        "latency": settings.get("latency", 0),
        "last_verified": settings.get("last_verified"),
        "has_personal_key": bool(settings.get("encrypted_api_key")),
        "masked_key": masked_key
    }

@router.put("/mode", response_model=AISettingsResponse)
def update_preferred_mode(req: PreferredModeRequest, current_user: dict = Depends(get_current_user)):
    """Switch immediately between shared and personal Gemini AI preferences."""
    user_id = current_user["_id"]
    settings = get_user_ai_settings(user_id)
    
    db["user_ai_settings"].update_one(
        {"user_id": user_id},
        {"$set": {
            "preferred_mode": req.preferred_mode,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return get_ai_settings(current_user)

@router.post("/verify", response_model=AISettingsResponse)
def connect_and_verify_key(
    req: ConnectAPIRequest, 
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Verify Gemini API Key health, dynamically list compatible models, and encrypt key to MongoDB."""
    user_id = current_user["_id"]
    key_candidate = req.api_key.strip()
    
    if not (key_candidate.startswith("AIzaSy") or key_candidate.startswith("AQ.")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google Gemini API key format. Key should start with 'AIzaSy' or 'AQ.'."
        )
        
    try:
        metrics = verify_and_test_gemini_key(key_candidate)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
        
    encrypted = encrypt_api_key(key_candidate)
    
    db["user_ai_settings"].update_one(
        {"user_id": user_id},
        {"$set": {
            "encrypted_api_key": encrypted,
            "status": "online",
            "latency": metrics["latency"],
            "available_models": metrics["available_models"],
            "selected_model": metrics["selected_model"],
            "last_verified": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    # Send email notification about API key update
    user_email = current_user.get("email")
    if user_email:
        username = current_user.get("username", "Candidate")
        date_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %I:%M %p UTC")
        device = request.headers.get("user-agent", "Unknown Device/Browser")
        ip = request.client.host if request.client else "Unknown IP"
        
        description = (
            f"Your personal Google Gemini API key was connected or updated successfully.\n\n"
            f"Event Details:\n"
            f"• Action: API Key Connected / Updated\n"
            f"• Date: {date_str}\n"
            f"• Device/Browser: {device}\n"
            f"• IP Address: {ip}"
        )
        alert_html = template_security_alert(username, "Personal API Key Connected", description)
        background_tasks.add_task(send_email_notification, user_email, "🛡️ Security Notification: API Key Connected", alert_html)
        
    return get_ai_settings(current_user)

@router.post("/test", response_model=AISettingsResponse)
def test_connection_health(current_user: dict = Depends(get_current_user)):
    """Run connection health checks and re-measure latency metrics for the active API provider."""
    user_id = current_user["_id"]
    settings = get_user_ai_settings(user_id)
    preferred_mode = settings.get("preferred_mode", "shared")
    
    if preferred_mode == "personal":
        encrypted_key = settings.get("encrypted_api_key")
        if not encrypted_key:
            raise HTTPException(status_code=400, detail="No personal API key configured to test.")
        key_to_test = decrypt_api_key(encrypted_key)
    else:
        key_to_test = os.getenv("GEMINI_API_KEY", "")
        if not key_to_test:
            raise HTTPException(status_code=500, detail="Shared API key is not configured in .env.")
            
    try:
        metrics = verify_and_test_gemini_key(key_to_test)
        db["user_ai_settings"].update_one(
            {"user_id": user_id},
            {"$set": {
                "status": "online",
                "latency": metrics["latency"],
                "available_models": metrics["available_models"],
                "last_verified": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }}
        )
    except Exception as err:
        db["user_ai_settings"].update_one(
            {"user_id": user_id},
            {"$set": {
                "status": "offline",
                "latency": 9999,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Connection health diagnostic failed: {str(err)}"
        )
        
    return get_ai_settings(current_user)

@router.delete("/personal-key", response_model=AISettingsResponse)
def remove_personal_key(
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Permanently delete personal API key, switch mode to shared, and trigger security alert email."""
    user_id = current_user["_id"]
    
    db["user_ai_settings"].update_one(
        {"user_id": user_id},
        {"$set": {
            "encrypted_api_key": None,
            "preferred_mode": "shared",
            "status": "online",
            "latency": 0,
            "last_verified": None,
            "available_models": MODEL_FALLBACK_CHAIN.copy(),
            "selected_model": "gemini-2.5-flash",
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    # Send email notification about API key removal
    user_email = current_user.get("email")
    if user_email:
        username = current_user.get("username", "Candidate")
        date_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %I:%M %p UTC")
        device = request.headers.get("user-agent", "Unknown Device/Browser")
        ip = request.client.host if request.client else "Unknown IP"
        
        description = (
            f"Your personal Google Gemini API key was removed from your account settings.\n\n"
            f"Event Details:\n"
            f"• Action: API Key Removed\n"
            f"• Date: {date_str}\n"
            f"• Device/Browser: {device}\n"
            f"• IP Address: {ip}"
        )
        alert_html = template_security_alert(username, "Personal API Key Removed", description)
        background_tasks.add_task(send_email_notification, user_email, "🛡️ Security Notification: API Key Removed", alert_html)
        
    return get_ai_settings(current_user)

@router.put("/model", response_model=AISettingsResponse)
def update_selected_model(req: UserUpdateAISettings, current_user: dict = Depends(get_current_user)):
    """Update selected model validation check."""
    user_id = current_user["_id"]
    settings = get_user_ai_settings(user_id)
    available = settings.get("available_models", MODEL_FALLBACK_CHAIN.copy())
    
    if req.selected_model and req.selected_model not in available:
        raise HTTPException(
            status_code=400, 
            detail=f"Selected model is not supported. Supported: {', '.join(available)}"
        )
        
    db["user_ai_settings"].update_one(
        {"user_id": user_id},
        {"$set": {
            "selected_model": req.selected_model,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return get_ai_settings(current_user)

@router.get("/alerts")
def get_pending_ai_alerts(current_user: dict = Depends(get_current_user)):
    """Fetch and clear pending AI quota or availability warnings for notifications rendering."""
    user_id = current_user["_id"]
    alerts = list(db["user_ai_notifications"].find({"user_id": user_id, "read": False}))
    
    # Mark alerts as read
    db["user_ai_notifications"].update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    for alert in alerts:
        alert["_id"] = str(alert["_id"])
        
    return alerts

@router.get("/admin-stats")
def get_admin_ai_stats(current_user: dict = Depends(get_current_user)):
    """Admin-only endpoint retrieving global usage distribution, latencies, and error rates."""
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Access denied. Administrator privileges required.")
        
    # Aggregate Stats
    total_requests = db["ai_usage_stats"].count_documents({})
    shared_requests = db["ai_usage_stats"].count_documents({"mode": "shared"})
    personal_requests = db["ai_usage_stats"].count_documents({"mode": "personal"})
    
    # Average Latency
    latency_pipeline = [
        {"$group": {"_id": None, "avg_latency": {"$avg": "$latency_ms"}}}
    ]
    latency_res = list(db["ai_usage_stats"].aggregate(latency_pipeline))
    avg_latency = int(latency_res[0]["avg_latency"]) if latency_res and latency_res[0].get("avg_latency") is not None else 0
    
    # Total Connected API keys
    connected_apis = db["user_ai_settings"].count_documents({"encrypted_api_key": {"$ne": None}})
    
    # Quota Warnings / Errors
    quota_warnings = db["user_ai_notifications"].count_documents({"message": {"$regex": "quota|exhausted", "$options": "i"}})
    
    # Most Used Model
    model_pipeline = [
        {"$group": {"_id": "$model", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    model_res = list(db["ai_usage_stats"].aggregate(model_pipeline))
    most_used_model = model_res[0]["_id"] if model_res else "None"
    
    # Daily usage trend (last 7 days)
    daily_pipeline = [
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at"
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}},
        {"$limit": 7}
    ]
    daily_usage = list(db["ai_usage_stats"].aggregate(daily_pipeline))
    
    return {
        "total_requests": total_requests,
        "shared_requests": shared_requests,
        "personal_requests": personal_requests,
        "avg_latency": avg_latency,
        "connected_apis": connected_apis,
        "quota_warnings": quota_warnings,
        "most_used_model": most_used_model,
        "daily_usage": daily_usage
    }
