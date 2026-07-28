from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.services.auth_services import get_current_user
from app.services.email_service import send_email_notification
from app.templates.email_templates import (
    template_welcome, template_login_notification,
    template_resume_analysis_ready, template_ats_improvement,
    template_security_alert
)

router = APIRouter(prefix="/email", tags=["email"])

class EmailTestRequest(BaseModel):
    event_type: str  # welcome, login, analysis_ready, ats_improvement, security_alert
    target_email: EmailStr

@router.post("/test-send", status_code=status.HTTP_200_OK)
def trigger_test_email(
    request: EmailTestRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Trigger a test email notification for validation."""
    username = current_user.get("username", "Candidate")
    email = request.target_email
    date_str = datetime.now().strftime("%B %d, %Y at %I:%M %p")

    if request.event_type == "welcome":
        subject = "🎉 Welcome to CareerBoost AI"
        html = template_welcome(username, email, date_str)

    elif request.event_type == "login":
        subject = "🔐 New Login Detected"
        html = template_login_notification(username, email, date_str)

    elif request.event_type == "analysis_ready":
        subject = "Your Resume Analysis is Ready"
        html = template_resume_analysis_ready(username, "Resume_Document.pdf", 88, "Excellent Candidate", "http://localhost:5173/dashboard")

    elif request.event_type == "ats_improvement":
        subject = "🎉 Congratulations! ATS Score Improved!"
        html = template_ats_improvement(username, "Resume_Document.pdf", 76, 88, "http://localhost:5173/dashboard")

    elif request.event_type == "security_alert":
        subject = "🛡️ Security Alert: Password Updated"
        html = template_security_alert(username, "Password Updated", "Your account password was recently changed.")

    else:
        raise HTTPException(status_code=400, detail="Invalid event type specified.")

    # Send in background thread so caller returns instantly
    background_tasks.add_task(send_email_notification, email, subject, html)

    return {
        "status": "success",
        "message": f"Email notification for '{request.event_type}' queued for delivery to {email}."
    }
