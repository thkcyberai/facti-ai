from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    industry: Optional[str] = None
    message: str
    form_type: Optional[str] = "contact"  # "contact" or "sales"

def send_email(to_email: str, subject: str, body: str):
    """Send email using Zoho SMTP"""
    smtp_server = os.getenv("SMTP_SERVER", "smtp.zoho.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL")
    
    msg = MIMEMultipart()
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))
    
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

@router.post("/submit")
async def submit_contact_form(form: ContactForm, background_tasks: BackgroundTasks):
    """
    Handle contact form submissions.
    Routes to contact@kycshield.ai or sales@kycshield.ai based on form_type.
    """
    try:
        # Determine recipient based on form type
        if form.form_type == "sales":
            recipient = os.getenv("SALES_EMAIL", "sales@kycshield.ai")
            subject = f"[KYCShield Sales Inquiry] {form.company or form.name}"
        else:
            recipient = os.getenv("CONTACT_EMAIL", "contact@kycshield.ai")
            subject = f"[KYCShield Contact] {form.name}"
        
        # Build email body
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #7c3aed;">New {form.form_type.capitalize()} Form Submission</h2>
            <hr style="border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 10px; font-weight: bold;">Name:</td><td style="padding: 10px;">{form.name}</td></tr>
                <tr><td style="padding: 10px; font-weight: bold;">Email:</td><td style="padding: 10px;">{form.email}</td></tr>
                <tr><td style="padding: 10px; font-weight: bold;">Company:</td><td style="padding: 10px;">{form.company or "Not provided"}</td></tr>
                <tr><td style="padding: 10px; font-weight: bold;">Industry:</td><td style="padding: 10px;">{form.industry or "Not provided"}</td></tr>
                <tr><td style="padding: 10px; font-weight: bold;">Message:</td><td style="padding: 10px;">{form.message}</td></tr>
                <tr><td style="padding: 10px; font-weight: bold;">Submitted:</td><td style="padding: 10px;">{timestamp}</td></tr>
            </table>
            <hr style="border: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">This email was sent from the KYCShield website contact form.</p>
        </body>
        </html>
        """
        
        # Send email in background
        background_tasks.add_task(send_email, recipient, subject, body)
        
        return {
            "success": True,
            "message": "Thank you for your inquiry. We'll be in touch within 24 hours.",
            "form_type": form.form_type
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process form: {str(e)}")

@router.get("/health")
async def contact_health():
    """Health check for contact endpoint"""
    return {"status": "healthy", "endpoint": "contact"}
