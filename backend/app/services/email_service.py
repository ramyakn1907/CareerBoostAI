import os
import smtplib
import logging
import email.utils
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Accept SMTP aliases commonly used in .env config
SMTP_SERVER = os.getenv("SMTP_SERVER") or os.getenv("SMTP_HOST") or "smtp.gmail.com"
SMTP_PORT = int(os.getenv("SMTP_PORT") or "587")
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL") or os.getenv("SMTP_FROM") or SMTP_USERNAME or "support@careerboost.ai"

IS_EMAIL_CONFIGURED = bool(SMTP_USERNAME and SMTP_PASSWORD)

def send_email_notification(to_email: str, subject: str, html_content: str) -> bool:
    """Send an HTML email notification via SMTP with automatic retry & logging."""
    if not IS_EMAIL_CONFIGURED:
        logger.info(f"📧 [MOCK EMAIL LOG] To: {to_email} | Subject: '{subject}' | Status: Sent (Mock Mode)")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SENDER_EMAIL
        msg["To"] = to_email

        html_part = MIMEText(html_content, "html")
        msg.attach(html_part)

        # Parse a clean email address from SENDER_EMAIL (which might contain a display name like "CareerBoost AI <user@email.com>")
        _, clean_sender = email.utils.parseaddr(SENDER_EMAIL)
        envelope_from = clean_sender or SMTP_USERNAME or SENDER_EMAIL

        # Connect to SMTP server
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(envelope_from, [to_email], msg.as_string())

        logger.info(f"✅ Email delivered successfully to {to_email} | Subject: {subject}")
        return True
    except Exception as e:
        logger.error(f"⚠️ Failed to send email to {to_email} using server {SMTP_SERVER}:{SMTP_PORT}: {str(e)}")
        return False
