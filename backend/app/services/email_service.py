import logging

logger = logging.getLogger(__name__)

# Email dispatch is completely disabled
IS_EMAIL_CONFIGURED = False

def send_email_notification(to_email: str, subject: str, html_content: str) -> bool:
    """Email notifications are disabled. Logs the action without making network calls."""
    logger.info(f"📧 [EMAIL DISABLED] Notification to '{to_email}' ('{subject}') was skipped.")
    return True
