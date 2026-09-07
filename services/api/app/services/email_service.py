"""
Email service -- sends appointment confirmation emails via Gmail SMTP.
Set SMTP_ENABLED=true and configure SMTP_USER/SMTP_PASSWORD in .env to activate.
"""
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


def _build_appointment_html(
    lead_name: str,
    lead_email: str,
    appointment_type: str,
    date: str,
    time: str,
    duration: str,
    address: Optional[str],
    notes: Optional[str],
    agent: Optional[str],
) -> str:
    address_row = "<tr><td style='padding:4px 0;color:#374151;'><b>Location:</b> " + (address or "") + "</td></tr>" if address else ""
    agent_row   = "<tr><td style='padding:4px 0;color:#374151;'><b>Agent:</b> " + (agent or "") + "</td></tr>" if agent else ""
    notes_row   = "<tr><td style='padding:4px 0;color:#374151;'><b>Notes:</b> " + (notes or "") + "</td></tr>" if notes else ""

    return """<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8faf9;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0"
  style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <tr><td style="background:linear-gradient(135deg,#0d9488,#059669);padding:32px 40px;text-align:center;">
    <div style="font-size:26px;font-weight:800;color:#fff;">CallMind AI</div>
    <div style="font-size:14px;color:rgba(255,255,255,0.85);margin-top:4px;">Appointment Confirmed</div>
  </td></tr>

  <tr><td style="padding:36px 40px;">
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Hi """ + lead_name + """!</h2>
    <p style="margin:0 0 24px;color:#4b5563;line-height:1.6;">
      Your <b>""" + appointment_type + """</b> has been scheduled. Here are the details:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f0fdf9;border:1px solid #d1fae5;border-radius:14px;padding:20px;margin-bottom:24px;">
      <tr><td style="padding:4px 0;color:#374151;"><b>Type:</b> """ + appointment_type + """</td></tr>
      <tr><td style="padding:4px 0;color:#374151;"><b>Date:</b> """ + date + """</td></tr>
      <tr><td style="padding:4px 0;color:#374151;"><b>Time:</b> """ + time + " (" + duration + """)</td></tr>
      """ + address_row + agent_row + notes_row + """
    </table>

    <p style="color:#4b5563;line-height:1.6;margin:0 0 24px;">
      Need to reschedule? Simply reply to this email or contact your agent.
    </p>

    <div style="text-align:center;">
      <a href="mailto:""" + lead_email + """"
        style="display:inline-block;background:linear-gradient(135deg,#0d9488,#059669);
          color:#fff;font-size:15px;font-weight:600;padding:13px 32px;
          border-radius:100px;text-decoration:none;">
        Contact Your Agent
      </a>
    </div>
  </td></tr>

  <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
    <p style="margin:0;font-size:11px;color:#9ca3af;">
      &copy; 2026 CallMind AI &middot; The intelligence layer for modern real estate operations.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>"""


def send_appointment_email(
    lead_name: str,
    lead_email: str,
    appointment_type: str,
    date: str,
    time: str,
    duration: str = "60 min",
    address: Optional[str] = None,
    notes: Optional[str] = None,
    agent: Optional[str] = None,
) -> bool:
    """
    Send an appointment confirmation email to the lead.
    Returns True if sent successfully, False otherwise.
    Silently no-ops if SMTP_ENABLED is False.
    """
    if not settings.SMTP_ENABLED:
        logger.info("[Email] SMTP disabled -- skipping email to %s", lead_email)
        return False

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("[Email] SMTP credentials not configured in .env")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Appointment Confirmed - CallMind AI"
        msg["From"] = settings.SMTP_FROM_NAME + " <" + settings.SMTP_USER + ">"
        msg["To"] = lead_email

        text_body = (
            "Hi " + lead_name + ",\n\n"
            "Your " + appointment_type + " is confirmed!\n\n"
            "Date: " + date + "\n"
            "Time: " + time + " (" + duration + ")\n"
            + ("Location: " + address + "\n" if address else "")
            + ("Agent: " + agent + "\n" if agent else "")
            + ("Notes: " + notes + "\n" if notes else "")
            + "\nCallMind AI"
        )

        html_body = _build_appointment_html(
            lead_name, lead_email, appointment_type, date, time, duration, address, notes, agent
        )

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, [lead_email], msg.as_string())

        logger.info("[Email] Appointment email sent to %s", lead_email)
        return True

    except Exception as exc:
        logger.error("[Email] Failed to send email to %s: %s", lead_email, exc)
        return False
