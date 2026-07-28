def get_email_base_wrapper(body_content: str, title: str = "CareerBoost AI Notification") -> str:
    """Return responsive sunset coral branded HTML email layout."""
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #120a1d;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #ffedd5;
      -webkit-font-smoothing: antialiased;
    }}
    .email-container {{
      max-width: 600px;
      margin: 0 auto;
      background-color: #1a0e2e;
      border: 1px solid rgba(249, 115, 22, 0.25);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }}
    .email-header {{
      background: linear-gradient(135deg, #120a1d 0%, #1a0e2e 100%);
      padding: 32px;
      text-align: center;
      border-bottom: 1px solid rgba(249, 115, 22, 0.2);
    }}
    .email-logo {{
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.5px;
    }}
    .email-logo span {{
      color: #f97316;
    }}
    .email-body {{
      padding: 36px 32px;
    }}
    .card {{
      background: rgba(36, 20, 61, 0.7);
      border: 1px solid rgba(249, 115, 22, 0.2);
      border-radius: 16px;
      padding: 20px;
      margin: 20px 0;
    }}
    .btn {{
      display: inline-block;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: #ffffff !important;
      font-weight: 700;
      font-size: 14px;
      padding: 14px 28px;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);
      margin: 16px 0;
    }}
    .badge {{
      display: inline-block;
      background: rgba(249, 115, 22, 0.15);
      border: 1px solid rgba(249, 115, 22, 0.3);
      color: #fdba74;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 20px;
      text-transform: uppercase;
    }}
    .email-footer {{
      border-top: 1px solid rgba(249, 115, 22, 0.15);
      background-color: #120a1d;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #f97316;
      opacity: 0.7;
    }}
    .email-footer a {{
      color: #fdba74;
      text-decoration: none;
      margin: 0 8px;
    }}
  </style>
</head>
<body>
  <div style="padding: 20px 10px;">
    <div class="email-container">
      <div class="email-header">
        <div class="email-logo">
          🚀 CareerBoost <span>AI</span>
        </div>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #fdba74; text-transform: uppercase; tracking-wider: 1px;">AI Resume Analyzer & Career Coach</p>
      </div>

      <div class="email-body">
        {body_content}
      </div>

      <div class="email-footer">
        <p style="margin-bottom: 8px;"><strong>CareerBoost AI</strong> • Professional Career Intelligence</p>
        <p style="margin-bottom: 12px;">Need assistance? <a href="mailto:support@careerboost.ai">support@careerboost.ai</a></p>
        <div>
          <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a> • <a href="#">Dashboard</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>"""


def template_welcome(username: str, email: str, date_str: str, app_url: str = "http://localhost:5173/dashboard") -> str:
    content = f"""
    <h2 style="color: #ffffff; margin-top: 0;">🎉 Welcome to CareerBoost AI!</h2>
    <p>Hello <strong>{username}</strong>,</p>
    <p>Welcome to CareerBoost AI! Your account has been successfully created and verified.</p>
    <p>We are excited to help you optimize your resume, boost your ATS compatibility score, prepare for technical interviews, and accelerate your software engineering career.</p>

    <div class="card">
      <h4 style="margin-top: 0; color: #fdba74;">Account Credentials Summary</h4>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Name:</strong> {username}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Email:</strong> {email}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Registration Date:</strong> {date_str}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Account Status:</strong> <span class="badge">Active Pro Plan</span></p>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="{app_url}" class="btn">Start Analyzing Resume &rarr;</a>
    </div>
    """
    return get_email_base_wrapper(content, "Welcome to CareerBoost AI")


def template_login_notification(username: str, email: str, date_str: str, device: str = "Desktop Browser", ip: str = "127.0.0.1", secure_url: str = "http://localhost:5173/settings") -> str:
    content = f"""
    <h2 style="color: #ffffff; margin-top: 0;">🔐 New Login Detected</h2>
    <p>Hello <strong>{username}</strong>,</p>
    <p>Your CareerBoost AI account was accessed successfully.</p>

    <div class="card">
      <h4 style="margin-top: 0; color: #fdba74;">Login Security Details</h4>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Account User:</strong> {username}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Email Address:</strong> {email}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Date & Time:</strong> {date_str}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Device & Browser:</strong> {device}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>IP Address:</strong> {ip}</p>
    </div>

    <p style="font-size: 13px; color: #ffedd5;">If this was you, no further action is required. If you did not log in, please reset your password immediately to secure your account.</p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="{secure_url}" class="btn" style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);">Secure My Account</a>
    </div>
    """
    return get_email_base_wrapper(content, "New Login Detected - Security Alert")


def template_resume_analysis_ready(username: str, filename: str, ats_score: int, overall_rating: str, report_url: str) -> str:
    badge_color = "#10b981" if ats_score >= 80 else "#f97316" if ats_score >= 60 else "#f43f5e"
    content = f"""
    <h2 style="color: #ffffff; margin-top: 0;">⚡ Your Resume Analysis is Ready!</h2>
    <p>Hello <strong>{username}</strong>,</p>
    <p>Our AI Engine has completed evaluating your uploaded resume document <strong>{filename}</strong>.</p>

    <div class="card" style="text-align: center; padding: 28px;">
      <span class="badge" style="background: rgba(249, 115, 22, 0.2); color: #fdba74;">ATS Scorecard</span>
      <div style="font-size: 48px; font-weight: 800; color: {badge_color}; margin: 12px 0;">{ats_score}%</div>
      <p style="margin: 0; font-weight: 700; color: #ffffff;">{overall_rating}</p>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="{report_url}" class="btn">View Full Audit Report &rarr;</a>
    </div>
    """
    return get_email_base_wrapper(content, "Your Resume Analysis is Ready")


def template_ats_improvement(username: str, filename: str, old_score: int, new_score: int, report_url: str) -> str:
    diff = new_score - old_score
    content = f"""
    <h2 style="color: #ffffff; margin-top: 0;">🎉 Congratulations! ATS Score Improved!</h2>
    <p>Hello <strong>{username}</strong>,</p>
    <p>Great job! Your latest resume upload for <strong>{filename}</strong> achieved a higher ATS compatibility rating than your previous version.</p>

    <div class="card" style="display: flex; justify-content: space-around; text-align: center;">
      <div style="flex: 1;">
        <span style="font-size: 11px; color: #f97316; text-transform: uppercase;">Previous Score</span>
        <div style="font-size: 28px; font-weight: 700; color: #94a3b8; margin-top: 4px;">{old_score}%</div>
      </div>
      <div style="flex: 1;">
        <span style="font-size: 11px; color: #10b981; text-transform: uppercase;">New Score</span>
        <div style="font-size: 28px; font-weight: 800; color: #10b981; margin-top: 4px;">{new_score}%</div>
      </div>
      <div style="flex: 1;">
        <span style="font-size: 11px; color: #fdba74; text-transform: uppercase;">Boost</span>
        <div style="font-size: 28px; font-weight: 800; color: #fdba74; margin-top: 4px;">+{diff}%</div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="{report_url}" class="btn">View Updated Diagnostics &rarr;</a>
    </div>
    """
    return get_email_base_wrapper(content, "ATS Score Milestone Reached!")


def template_security_alert(username: str, event_title: str, description: str, secure_url: str = "http://localhost:5173/settings") -> str:
    content = f"""
    <h2 style="color: #ffffff; margin-top: 0;">🛡️ Security Alert: {event_title}</h2>
    <p>Hello <strong>{username}</strong>,</p>
    <p>{description}</p>

    <div class="card" style="border-color: rgba(244, 63, 94, 0.4);">
      <h4 style="margin-top: 0; color: #f43f5e;">Security Event Details</h4>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Event:</strong> {event_title}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Time:</strong> Just now</p>
    </div>

    <p style="font-size: 12px; color: #ffedd5;">If you authorized this change, no action is needed. If you did not authorize this change, please lock your account immediately.</p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="{secure_url}" class="btn" style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);">Review Account Security</a>
    </div>
    """
    return get_email_base_wrapper(content, f"Security Alert - {event_title}")
