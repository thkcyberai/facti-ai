from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base, get_db
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic model for request
class NewsletterSubscribe(BaseModel):
    email: EmailStr
    source: str = "landing_page"

# Pydantic model for response
class NewsletterResponse(BaseModel):
    success: bool
    message: str

# SQLAlchemy model for newsletter subscribers
class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    source = Column(String(100), default="landing_page")
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    unsubscribed_at = Column(DateTime(timezone=True), nullable=True)

def send_notification_email(subscriber_email: str, source: str):
    """Send notification email to admin when someone subscribes"""
    try:
        smtp_server = os.getenv("SMTP_SERVER", "smtp.zoho.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        from_email = os.getenv("SMTP_FROM_EMAIL")
        
        if not all([smtp_username, smtp_password, from_email]):
            logger.warning("SMTP not configured, skipping notification")
            return
        
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = "contact@kycshield.ai"
        msg['Subject'] = f"New Newsletter Subscriber - KYCShield"
        
        body = f"""
New subscriber to KYCShield Newsletter!

Email: {subscriber_email}
Source: {source}

---
Total subscribers can be viewed at:
https://api.kycshield.ai/api/v1/newsletter/subscribers/count

KYCShield Notification System
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        logger.info(f"Notification email sent for subscriber: {subscriber_email}")
        
    except Exception as e:
        logger.error(f"Failed to send notification email: {str(e)}")

@router.post("/subscribe", response_model=NewsletterResponse)
async def subscribe_newsletter(
    data: NewsletterSubscribe,
    db: Session = Depends(get_db)
):
    """
    Subscribe to KYCShield newsletter
    """
    try:
        # Check if email already exists
        existing = db.query(NewsletterSubscriber).filter(
            NewsletterSubscriber.email == data.email.lower()
        ).first()
        
        if existing:
            if existing.is_active:
                return NewsletterResponse(
                    success=True,
                    message="You're already subscribed!"
                )
            else:
                # Reactivate subscription
                existing.is_active = True
                existing.unsubscribed_at = None
                existing.source = data.source
                db.commit()
                logger.info(f"Newsletter resubscription: {data.email}")
                send_notification_email(data.email, f"{data.source} (resubscribed)")
                return NewsletterResponse(
                    success=True,
                    message="Welcome back! Your subscription has been reactivated."
                )
        
        # Create new subscriber
        subscriber = NewsletterSubscriber(
            email=data.email.lower(),
            source=data.source
        )
        db.add(subscriber)
        db.commit()
        
        logger.info(f"New newsletter subscription: {data.email} from {data.source}")
        
        # Send notification email to admin
        send_notification_email(data.email, data.source)
        
        return NewsletterResponse(
            success=True,
            message="Successfully subscribed! We'll keep you updated."
        )
        
    except Exception as e:
        logger.error(f"Newsletter subscription error: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to process subscription. Please try again."
        )

@router.get("/subscribers/count")
async def get_subscriber_count(db: Session = Depends(get_db)):
    """
    Get total active subscriber count (for admin)
    """
    count = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.is_active == True
    ).count()
    return {"count": count}
