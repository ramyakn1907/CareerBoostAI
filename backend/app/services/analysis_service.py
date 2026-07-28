from bson import ObjectId
from datetime import datetime, timezone
from typing import List, Optional
from app.config.database import db
from app.models.analysis_model import ResumeAnalysisSchema

def save_analysis(user_id: str, filename: str, extracted_text: str, analysis: ResumeAnalysisSchema) -> dict:
    """Save resume text and analysis results into the analyses collection."""
    analysis_doc = {
        "user_id": ObjectId(user_id),
        "filename": filename,
        "extracted_text": extracted_text,
        "uploaded_at": datetime.now(timezone.utc),
        "analysis_details": analysis.model_dump()
    }
    result = db["analyses"].insert_one(analysis_doc)
    analysis_doc["_id"] = str(result.inserted_id)
    analysis_doc["user_id"] = str(analysis_doc["user_id"])
    return analysis_doc

def get_user_analyses(user_id: str) -> List[dict]:
    """Retrieve all historical analyses metadata for a user (sorted by most recent)."""
    cursor = db["analyses"].find(
        {"user_id": ObjectId(user_id)},
        {"filename": 1, "uploaded_at": 1, "analysis_details.ats_score": 1, "analysis_details.overall_rating": 1}
    ).sort("uploaded_at", -1)
    
    analyses = []
    for doc in cursor:
        analyses.append({
            "_id": str(doc["_id"]),
            "filename": doc["filename"],
            "uploaded_at": doc["uploaded_at"],
            "ats_score": doc["analysis_details"]["ats_score"],
            "overall_rating": doc["analysis_details"]["overall_rating"]
        })
    return analyses

def get_analysis_by_id(analysis_id: str, user_id: str) -> Optional[dict]:
    """Retrieve detailed analysis object by ID, ensuring ownership by requesting user."""
    try:
        doc = db["analyses"].find_one({
            "_id": ObjectId(analysis_id),
            "user_id": ObjectId(user_id)
        })
        if doc:
            doc["_id"] = str(doc["_id"])
            doc["user_id"] = str(doc["user_id"])
            return doc
        return None
    except Exception:
        return None

def delete_analysis_by_id(analysis_id: str, user_id: str) -> bool:
    """Delete analysis report if owned by user."""
    try:
        result = db["analyses"].delete_one({
            "_id": ObjectId(analysis_id),
            "user_id": ObjectId(user_id)
        })
        return result.deleted_count > 0
    except Exception:
        return False
