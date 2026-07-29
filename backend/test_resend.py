import os
import sys
from dotenv import load_dotenv

# Ensure the backend app module is in the Python search path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.email_service import send_email_notification

def main():
    load_dotenv()
    
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        print("\n[ERROR] RESEND_API_KEY is not defined in your backend/.env file.")
        print("Please add the following line to your backend/.env:")
        print("RESEND_API_KEY=your_actual_resend_api_key")
        return
        
    print(f"\n[OK] Found RESEND_API_KEY in .env: {api_key[:6]}...{api_key[-4:] if len(api_key) > 10 else ''}")
    
    # Check if the SENDER_EMAIL is still default or set
    sender = os.getenv("SENDER_EMAIL") or os.getenv("SMTP_FROM") or "support@careerboost.ai"
    print(f"[OK] Configured Sender: {sender}")
    if "onboarding@resend.dev" in sender:
        print("[NOTE] Using 'onboarding@resend.dev' allows you to send only to the email address registered with your Resend account (free tier).")
    
    recipient = input("\nEnter recipient email address to send a test email to: ").strip()
    if not recipient:
        print("[ERROR] Recipient email cannot be empty.")
        return
        
    print(f"\nSending test email via Resend API to: {recipient}...")
    subject = "Resend API Integration Test"
    html_content = """
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #ea580c;">CareerBoost AI Integration Test</h2>
        <p>This is a test email verifying that your <strong>Resend API key</strong> configuration is fully functional!</p>
        <p>If you received this, everything is working correctly.</p>
    </div>
    """
    
    import time
    start_time = time.time()
    success = send_email_notification(recipient, subject, html_content)
    elapsed_time = time.time() - start_time
    if success:
        print(f"\n[SUCCESS] The test email was sent successfully in {elapsed_time:.2f} seconds.")
    else:
        print(f"\n[ERROR] Failed to send the test email in {elapsed_time:.2f} seconds. Check the backend log warnings above for API errors.")

if __name__ == "__main__":
    main()
