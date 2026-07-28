import os
import smtplib
import logging
import email.utils
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Accept HTTP API keys for Render Free Tier (bypasses SMTP block)
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")

# Accept SMTP aliases commonly used in .env config
SMTP_SERVER = os.getenv("SMTP_SERVER") or os.getenv("SMTP_HOST") or "smtp.gmail.com"
SMTP_PORT = int(os.getenv("SMTP_PORT") or "587")
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL") or os.getenv("SMTP_FROM") or SMTP_USERNAME or "support@careerboost.ai"

IS_EMAIL_CONFIGURED = bool(SMTP_USERNAME and SMTP_PASSWORD) or bool(RESEND_API_KEY) or bool(BREVO_API_KEY)

def send_email_notification(to_email: str, subject: str, html_content: str) -> bool:
    """Send an HTML email notification via Resend API, Brevo API, or SMTP."""
    
    # 1. Try Resend API (HTTP Port 443 - Bypasses Render Port Block)
    if RESEND_API_KEY:
        try:
            logger.info("Attempting to send email via Resend API...")
            from_email = SENDER_EMAIL
            if "onboarding@resend.dev" in from_email or not from_email:
                from_email = "CareerBoost AI <onboarding@resend.dev>"
            
            headers = {
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "from": from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            res = httpx.post("https://api.resend.com/emails", json=payload, headers=headers, timeout=10.0)
            if res.status_code in [200, 201]:
                logger.info(f"✅ Email delivered via Resend API to {to_email}")
                return True
            else:
                logger.error(f"Resend API error: {res.status_code} - {res.text}")
        except Exception as e:
            logger.error(f"Failed to send email via Resend API: {e}")

    # 2. Try Brevo API (HTTP Port 443 - Bypasses Render Port Block)
    if BREVO_API_KEY:
        try:
            logger.info("Attempting to send email via Brevo API...")
            headers = {
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            sender_name, sender_email = email.utils.parseaddr(SENDER_EMAIL)
            sender_name = sender_name or "CareerBoost AI"
            sender_email = sender_email or SMTP_USERNAME or "support@careerboost.ai"

            payload = {
                "sender": {"name": sender_name, "email": sender_email},
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html_content
            }
            res = httpx.post("https://api.brevo.com/v3/smtp/email", json=payload, headers=headers, timeout=10.0)
            if res.status_code in [200, 201]:
                logger.info(f"✅ Email delivered via Brevo API to {to_email}")
                return True
            else:
                logger.error(f"Brevo API error: {res.status_code} - {res.text}")
        except Exception as e:
            logger.error(f"Failed to send email via Brevo API: {e}")

    # 3. Fallback to standard SMTP (Gmail SMTP, etc.)
    if SMTP_USERNAME and SMTP_PASSWORD:
        try:
            logger.info("Attempting to send email via SMTP...")
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = SENDER_EMAIL
            msg["To"] = to_email

            html_part = MIMEText(html_content, "html")
            msg.attach(html_part)

            _, clean_sender = email.utils.parseaddr(SENDER_EMAIL)
            envelope_from = clean_sender or SMTP_USERNAME or SENDER_EMAIL

            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.sendmail(envelope_from, [to_email], msg.as_string())

            logger.info(f"✅ Email delivered successfully to {to_email} via SMTP")
            return True
        except Exception as e:
            logger.error(f"⚠️ Failed to send email via SMTP: {str(e)}")
            return False

    # 4. Mock Mode if no credentials configured
    logger.info(f"📧 [MOCK EMAIL LOG] To: {to_email} | Subject: '{subject}' | Status: Sent (Mock Mode)")
    return True
