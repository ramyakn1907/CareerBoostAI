import os
import time
import logging
import base64
from typing import Callable, Any, List
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from cryptography.fernet import Fernet
from google.genai import errors

from app.config.database import db

logger = logging.getLogger(__name__)

# Fallback models in order of priority
MODEL_FALLBACK_CHAIN = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]

def get_crypt_key() -> bytes:
    """Read or derive symmetric key for API key encryption."""
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        # Fallback key generated from static seed to maintain local persistence
        static_seed = b"CareerBoostAIEncryptionSeedKey_32"
        return base64.urlsafe_b64encode(static_seed[:32])
    try:
        base64.urlsafe_b64decode(key)
        return key.encode()
    except Exception:
        return base64.urlsafe_b64encode(key.encode().ljust(32)[:32])

def encrypt_api_key(plain_key: str) -> str:
    """Encrypt a plain text API key."""
    if not plain_key:
        return ""
    f = Fernet(get_crypt_key())
    return f.encrypt(plain_key.encode()).decode()

def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt an encrypted API key back to plain text."""
    if not encrypted_key:
        return ""
    f = Fernet(get_crypt_key())
    try:
        return f.decrypt(encrypted_key.encode()).decode()
    except Exception as e:
        logger.error(f"Failed to decrypt API Key: {str(e)}")
        return ""

def mask_api_key(key: str) -> str:
    """Mask key format to: AIzaSy************ABCD"""
    if not key:
        return ""
    if len(key) <= 10:
        return "****"
    return f"{key[:6]}************{key[-4:]}"

def save_ai_alert(user_id: str, message: str, alert_type: str = "warning"):
    """Persist temporary toast notification alerts to show to the user on next query."""
    try:
        db["user_ai_notifications"].insert_one({
            "user_id": user_id,
            "message": message,
            "type": alert_type,
            "read": False,
            "created_at": datetime.now(timezone.utc)
        })
    except Exception as e:
        logger.error(f"Failed to save AI notification alert: {e}")

def record_ai_usage_stats(user_id: str, mode: str, model: str, latency_ms: int, success: bool, error_msg: str = None):
    """Log analytical metrics for the admin usage dashboard."""
    try:
        db["ai_usage_stats"].insert_one({
            "user_id": user_id,
            "mode": mode,  # "shared" or "personal"
            "model": model,
            "latency_ms": latency_ms,
            "success": success,
            "error_msg": error_msg,
            "created_at": datetime.now(timezone.utc)
        })
    except Exception as e:
        logger.error(f"Failed to log AI metrics: {e}")

def get_user_ai_settings(user_id: str) -> dict:
    """Load or initialize default AI Provider Settings document for a user."""
    settings = db["user_ai_settings"].find_one({"user_id": user_id})
    if not settings:
        settings = {
            "user_id": user_id,
            "provider": "google-gemini",
            "encrypted_api_key": None,
            "preferred_mode": "shared",
            "selected_model": "gemini-3.5-flash",
            "available_models": MODEL_FALLBACK_CHAIN.copy(),
            "status": "online",
            "latency": 0,
            "last_verified": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "active": True
        }
        db["user_ai_settings"].insert_one(settings)
    else:
        # Migrate selected_model and available_models if legacy/deprecated
        if settings.get("selected_model") not in MODEL_FALLBACK_CHAIN:
            settings["selected_model"] = "gemini-3.5-flash"
            db["user_ai_settings"].update_one(
                {"_id": settings["_id"]},
                {"$set": {
                    "selected_model": "gemini-3.5-flash",
                    "available_models": MODEL_FALLBACK_CHAIN.copy()
                }}
            )
            settings["available_models"] = MODEL_FALLBACK_CHAIN.copy()
    
    settings["_id"] = str(settings["_id"])
    return settings

def execute_gemini_request(user_id: str, request_fn: Callable[..., Any], *args, **kwargs) -> Any:
    """
    Intelligent high-resiliency router that directs request to the appropriate API key 
    and handles dynamic fallback, notifications, and model recoveries.
    """
    settings = get_user_ai_settings(user_id)
    preferred_mode = settings.get("preferred_mode", "shared")
    selected_model = settings.get("selected_model", "gemini-2.5-flash")
    
    shared_key = os.getenv("GEMINI_API_KEY", "")
    personal_encrypted_key = settings.get("encrypted_api_key")
    has_personal_key = bool(personal_encrypted_key)
    personal_key = decrypt_api_key(personal_encrypted_key) if has_personal_key else ""

    start_time = time.time()
    
    # 1. Personal API Execution Flow
    if preferred_mode == "personal":
        if not personal_key:
            # Fallback to shared if personal key selected but not supplied
            logger.warning(f"User {user_id} preferred personal API key, but none is connected. Routing to shared key.")
            preferred_mode = "shared"
        else:
            try:
                # Try personal key with selected model
                result = invoke_model_with_fallback(personal_key, selected_model, request_fn, *args, **kwargs)
                latency = int((time.time() - start_time) * 1000)
                record_ai_usage_stats(user_id, "personal", selected_model, latency, True)
                return result
            except Exception as e:
                logger.error(f"Personal Gemini API failed for user {user_id}: {str(e)}. Attempting shared fallback.")
                save_ai_alert(
                    user_id, 
                    "Your personal Gemini API is temporarily unavailable. CareerBoost AI automatically switched to the shared AI service."
                )
                # Fallback to shared key
                try:
                    result = invoke_model_with_fallback(shared_key, selected_model, request_fn, *args, **kwargs)
                    latency = int((time.time() - start_time) * 1000)
                    record_ai_usage_stats(user_id, "shared", selected_model, latency, True)
                    return result
                except Exception as shared_err:
                    record_ai_usage_stats(user_id, "shared", selected_model, 0, False, str(shared_err))
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="AI service is temporarily unavailable. Both personal and shared AI connections failed."
                    )

    # 2. Shared API Execution Flow
    if preferred_mode == "shared":
        try:
            # Try shared key with selected model
            result = invoke_model_with_fallback(shared_key, selected_model, request_fn, *args, **kwargs)
            latency = int((time.time() - start_time) * 1000)
            record_ai_usage_stats(user_id, "shared", selected_model, latency, True)
            return result
        except errors.APIError as quota_err:
            if quota_err.code == 429:
                # Check if user has personal fallback key
                if personal_key:
                    logger.warning(f"Shared Gemini quota exhausted. Automatically routing user {user_id} to personal API key.")
                    save_ai_alert(
                        user_id,
                        "The shared CareerBoost AI quota has been exhausted. Your personal Gemini API has been activated automatically."
                    )
                    try:
                        result = invoke_model_with_fallback(personal_key, selected_model, request_fn, *args, **kwargs)
                        latency = int((time.time() - start_time) * 1000)
                        record_ai_usage_stats(user_id, "personal", selected_model, latency, True)
                        return result
                    except Exception as personal_err:
                        record_ai_usage_stats(user_id, "personal", selected_model, 0, False, str(personal_err))
                        raise HTTPException(
                            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="AI service is temporarily unavailable. Shared quota is exhausted, and personal API verification failed."
                        )
                else:
                    record_ai_usage_stats(user_id, "shared", selected_model, 0, False, str(quota_err))
                    save_ai_alert(
                        user_id,
                        "The shared AI quota has been exhausted. Connect your own Gemini API to continue using AI instantly."
                    )
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="The shared AI quota has been exhausted. Connect your own Gemini API to continue using AI instantly."
                    )
            else:
                record_ai_usage_stats(user_id, "shared", selected_model, 0, False, str(quota_err))
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"AI service error: {str(quota_err)}"
                )
        except Exception as general_err:
            record_ai_usage_stats(user_id, "shared", selected_model, 0, False, str(general_err))
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"AI service error: {str(general_err)}"
            )

def invoke_model_with_fallback(api_key: str, model_name: str, request_fn: Callable[..., Any], *args, **kwargs) -> Any:
    """Helper that runs request_fn while recovering from model availability exceptions using MODEL_FALLBACK_CHAIN."""
    models_to_try = [model_name] + [m for m in MODEL_FALLBACK_CHAIN if m != model_name]
    
    last_err = None
    for target_model in models_to_try:
        try:
            # Execute actual call passing configured API key and chosen model name
            return request_fn(api_key, target_model, *args, **kwargs)
        except errors.APIError as api_err:
            if api_err.code == 429:
                raise api_err
            err_msg = str(api_err).lower()
            # If the error is not about model validity, propagate it immediately without model fallback
            if "model" not in err_msg and "not found" not in err_msg and "unsupported" not in err_msg:
                raise api_err
            last_err = api_err
            logger.warning(f"Model {target_model} is unsupported or unavailable. Trying model fallback chain.")
            continue
        except Exception as general_err:
            # Rethrow immediately for quota, connection, or authentication errors
            raise general_err
            
    if last_err:
        raise last_err
    raise Exception("Model execution chain failed.")
