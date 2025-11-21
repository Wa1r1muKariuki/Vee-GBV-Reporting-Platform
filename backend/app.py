# app.py - Enhanced with NLP Intelligence
import os
import json
import random
import logging
from datetime import datetime
from typing import Optional, List
import asyncio

from cachetools import TTLCache
import httpx

from fastapi import FastAPI, HTTPException, Header, Request, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from sqlalchemy.orm import Session

# Local imports
from database import get_db, engine
from models import Base, IncidentReport
from schemas import (
    ChatRequest, ChatResponse,
    IncidentRequest, IncidentResponse,
    ResourceResponse
)
from crypto_utils import encrypt_text, decrypt_text, generate_anonymous_id

# Translation import
from googletrans import Translator

# Import NLP Engine
import sys
sys.path.append('../nlp_engine')
from analyzer import VeeNLP

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

# Configuration
ADMIN_TOKEN = os.getenv("VEE_ADMIN_TOKEN", "change_me_in_production")
RASA_URL = os.getenv("RASA_URL", "http://localhost:5005")

# FastAPI app
app = FastAPI(
    title="Vee - Trauma-Informed GBV Reporting",
    description="AI-powered GBV support system with NLP",
    version="2.0.0"
)

# Initialize NLP Engine
nlp_engine = VeeNLP()
logger.info("✅ NLP Engine loaded successfully")

# Translation setup
translator = Translator()
cache = TTLCache(maxsize=1000, ttl=3600)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://vee-frontend.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== HELPER FUNCTIONS ====================

def fuzz_coordinates(lat: float, lon: float, radius_km: float = 5.0):
    """Add random offset to coordinates for privacy"""
    lat_offset = (random.random() - 0.5) * (radius_km / 111.0) * 2
    lon_offset = (random.random() - 0.5) * (radius_km / 111.0) * 2
    return lat + lat_offset, lon + lon_offset


def verify_admin(x_admin_token: str = Header(...)):
    """Verify admin token"""
    if x_admin_token != ADMIN_TOKEN:
        logger.warning("Failed admin access attempt")
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


def get_resources_for_county(county: Optional[str], needs: List[str]) -> List[dict]:
    """Get support resources based on location and needs"""
    resources = [
        {
            "name": "GBV National Helpline",
            "type": "hotline",
            "contact": "1195",
            "availability": "24/7",
            "description": "Free, confidential support",
            "services": ["crisis_support", "counseling", "referrals"]
        },
        {
            "name": "FIDA Kenya",
            "type": "legal",
            "contact": "0800 720 553",
            "availability": "Mon-Fri 9am-5pm",
            "description": "Free legal aid for women",
            "services": ["legal_aid", "court_representation", "protection_orders"]
        },
        {
            "name": "Gender Violence Recovery Centre",
            "type": "medical",
            "contact": "0709 983 000 / 0730 630 000",
            "availability": "24/7",
            "description": "Medical care and psychosocial support",
            "services": ["medical_care", "counseling", "safe_space"]
        }
    ]

    # County-specific resources
    county_resources = {
        "nairobi": [
            {
                "name": "Nairobi Women's Hospital GBV Centre",
                "type": "medical",
                "contact": "0722-845-841",
                "location": "Hurlingham, Nairobi",
                "services": ["medical", "counseling", "legal", "forensic"]
            },
            {
                "name": "Kenyatta National Hospital Gender Violence Unit",
                "type": "medical",
                "contact": "0726 300 175",
                "location": "KNH, Nairobi",
                "services": ["medical", "PEP", "forensic"]
            }
        ],
        "mombasa": [
            {
                "name": "Coast General Hospital GBV Unit",
                "type": "medical",
                "contact": "041-231-4204",
                "location": "Mombasa",
                "services": ["medical", "counseling"]
            }
        ],
        "kisumu": [
            {
                "name": "JARAMOGI Oginga Odinga Teaching Hospital",
                "type": "medical",
                "contact": "057-202-0989",
                "location": "Kisumu",
                "services": ["medical", "counseling"]
            }
        ]
    }

    if county and county.lower() in county_resources:
        resources.extend(county_resources[county.lower()])

    # Filter by needs if specified
    if needs and "all" not in needs:
        filtered = []
        for resource in resources:
            resource_services = resource.get("services", [])
            if any(need in resource_services for need in needs):
                filtered.append(resource)
        return filtered if filtered else resources

    return resources


async def send_to_rasa(message: str, sender_id: str, metadata: dict = None) -> dict:
    """Send message to Rasa and get response"""
    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "sender": sender_id,
                "message": message
            }
            
            if metadata:
                payload["metadata"] = metadata

            response = await client.post(
                f"{RASA_URL}/webhooks/rest/webhook",
                json=payload,
                timeout=15.0
            )
            
            if response.status_code == 200:
                rasa_responses = response.json()
                return {
                    "success": True,
                    "responses": rasa_responses
                }
            else:
                logger.error(f"Rasa returned {response.status_code}")
                return {
                    "success": False,
                    "error": f"Rasa returned status {response.status_code}"
                }
        except httpx.TimeoutException:
            logger.error("Rasa timeout")
            return {
                "success": False,
                "error": "Rasa connection timeout"
            }
        except Exception as e:
            logger.error(f"Rasa error: {str(e)}")
            return {
                "success": False,
                "error": f"Rasa connection failed: {str(e)}"
            }


# ==================== ROUTES ====================

@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "healthy",
        "service": "Vee GBV Reporting System",
        "version": "2.0.0",
        "nlp_status": "active",
        "features": ["intelligent_nlp", "trauma_informed", "multilingual"]
    }


@app.post("/chat", response_model=ChatResponse)
@limiter.limit("30/minute")
async def chat_endpoint(
    request: Request,
    chat_request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Main chat endpoint with NLP intelligence:
    1. Analyzes message with NLP for emotion, intent, entities
    2. Detects report initiation automatically
    3. Sends to Rasa with enriched context
    4. Returns adaptive response
    """
    session_id = chat_request.session_id or generate_anonymous_id()
    user_message = chat_request.message

    # === STEP 1: NLP ANALYSIS ===
    conversation_history = getattr(chat_request, "conversation_history", [])
    nlp_result = nlp_engine.analyze_full_context(
        user_message,
        conversation_history[-5:] if conversation_history else []
    )

    logger.info(f"NLP Analysis - Emotion: {nlp_result['emotion']['primary_emotion']}, "
                f"Report detected: {nlp_result['report_detection']['is_report_initiation']}")

    # === STEP 2: CHECK FOR EMERGENCY ===
    if nlp_result['response_strategy']['escalation_needed']:
        emergency_response = {
            "sender": "bot",
            "text": "🚨 **If you're in immediate danger:**\n\n"
                    "• Police: 999 / 112\n"
                    "• GBV Helpline: 1195 (24/7, toll-free)\n"
                    "• Gender Violence Recovery Centre: 0709 983 000\n\n"
                    "I'm here to support you. What would help you most right now?",
            "quick_replies": [
                {"title": "Get resources", "payload": "/ask_about_resources"},
                {"title": "Start report", "payload": "/start_report"},
                {"title": "Just talk", "payload": "/chitchat"}
            ],
            "metadata": {
                "session_id": session_id,
                "nlp_analysis": nlp_result,
                "emergency": True
            }
        }
        return ChatResponse(**emergency_response)

    # === STEP 3: SEND TO RASA WITH NLP CONTEXT ===
    rasa_metadata = {
        "emotion": nlp_result["emotion"]["primary_emotion"],
        "entities": nlp_result["entities"],
        "is_report_start": nlp_result["report_detection"]["is_report_initiation"],
        "tone": nlp_result["response_strategy"]["tone"]
    }

    rasa_result = await send_to_rasa(user_message, session_id, rasa_metadata)

    # === STEP 4: HANDLE RASA RESPONSE ===
    if not rasa_result["success"]:
        # Intelligent fallback based on NLP analysis
        strategy = nlp_result["response_strategy"]
        
        if strategy["next_action"] == "start_report_flow":
            bot_text = ("I understand you want to report something. Before we begin, "
                       "I want you to know this is a safe space. Everything is confidential. "
                       "Do you consent to proceed?")
            quick_replies = [
                {"title": "Yes, I consent", "payload": "/affirm"},
                {"title": "Not now", "payload": "/deny"}
            ]
        else:
            bot_text = "I'm here to listen and support you. Can you tell me more about what you need?"
            quick_replies = [
                {"title": "Report incident", "payload": "/start_report"},
                {"title": "Get resources", "payload": "/ask_about_resources"},
                {"title": "Just talk", "payload": "/chitchat"}
            ]
    else:
        rasa_responses = rasa_result["responses"]
        bot_text = " ".join([r.get("text", "") for r in rasa_responses if r.get("text")])
        
        # Extract buttons from Rasa
        quick_replies = []
        for r in rasa_responses:
            if "buttons" in r:
                quick_replies = [
                    {"title": btn.get("title", ""), "payload": btn.get("payload", "")}
                    for btn in r["buttons"]
                ]

    # === STEP 5: TRANSLATE IF NEEDED ===
    user_lang = getattr(chat_request, "language", "en")
    if user_lang == "sw" and bot_text:
        try:
            cache_key = (bot_text, user_lang)
            if cache_key not in cache:
                result = translator.translate(bot_text, dest=user_lang)
                cache[cache_key] = result.text
            bot_text = cache[cache_key]
        except Exception as e:
            logger.error(f"Translation error: {e}")

    # === STEP 6: LOG INTERACTION ===
    logger.info(f"Chat - Session: {session_id[:8]}..., Emotion: {nlp_result['emotion']['primary_emotion']}")

    return ChatResponse(
        sender="bot",
        text=bot_text,
        quick_replies=quick_replies,
        metadata={
            "session_id": session_id,
            "nlp_analysis": nlp_result,
            "response_strategy": nlp_result["response_strategy"]
        }
    )


@app.post("/analyze")
async def analyze_text(chat_request: ChatRequest):
    """Standalone NLP analysis endpoint for debugging/testing"""
    result = nlp_engine.analyze_full_context(
        chat_request.message,
        getattr(chat_request, "conversation_history", [])
    )
    return {
        "success": True,
        "analysis": result
    }


@app.post("/report/submit", response_model=IncidentResponse)
@limiter.limit("10/hour")
async def submit_incident_report(
    request: Request,
    incident: IncidentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Submit encrypted incident report with NLP-enhanced metadata"""
    if not incident.consent_given:
        raise HTTPException(status_code=400, detail="Consent required to submit report")

    # Encrypt sensitive fields
    encrypted_description = encrypt_text(incident.incident_description) if incident.incident_description else None
    encrypted_location = encrypt_text(incident.location_description) if incident.location_description else None

    # Fuzz coordinates for privacy
    lat, lon = None, None
    if incident.latitude and incident.longitude:
        lat, lon = fuzz_coordinates(incident.latitude, incident.longitude, radius_km=5.0)

    # Generate anonymous report ID
    report_id_hash = generate_anonymous_id()

    # Create report
    report = IncidentReport(
        report_id_hash=report_id_hash,
        incident_description_encrypted=encrypted_description,
        location_description_encrypted=encrypted_location,
        county=incident.county,
        incident_type=incident.incident_type.value if incident.incident_type else None,
        timeframe=incident.timeframe.value if incident.timeframe else None,
        relationship_type=incident.relationship_to_perpetrator.value if incident.relationship_to_perpetrator else None,
        support_needs=json.dumps([s.value for s in incident.support_needs]) if incident.support_needs else None,
        reporting_barriers=json.dumps([b.value for b in incident.reporting_barriers]) if incident.reporting_barriers else None,
        reported_to_authorities=incident.reported_to_authorities,
        latitude=lat,
        longitude=lon,
        location_accuracy_km=5.0,
        language=incident.language_used,
        source=incident.source,
        timestamp=datetime.utcnow()
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    logger.info(f"✅ Report submitted: {report_id_hash[:8]}...")

    # Get personalized resources
    support_needs = [s.value for s in incident.support_needs] if incident.support_needs else ["all"]
    county_resources = get_resources_for_county(incident.county, support_needs)

    return IncidentResponse(
        status="success",
        message="Your report has been recorded safely and anonymously. You're very brave.",
        report_id=report_id_hash[:8],
        resources=county_resources,
        next_steps=[
            "🚨 If in immediate danger: Call 999 or 1195",
            "🏥 Medical care: Within 72 hours for PEP",
            "⚖️ Legal support: FIDA Kenya 0800 720 553 (free)",
            "💜 Counseling: 1190 or 0722 178177 (24/7)"
        ]
    )


@app.get("/resources", response_model=ResourceResponse)
async def get_resources(
    county: Optional[str] = None,
    support_type: Optional[str] = None
):
    """Get support resources filtered by location and type"""
    needs = [support_type] if support_type else ["all"]
    resources = get_resources_for_county(county, needs)

    emergency_numbers = {
        "gbv_helpline": "1195 (24/7, toll-free)",
        "police": "999 / 112",
        "gender_violence_recovery": "0709 983 000",
        "fida_kenya": "0800 720 553",
        "befrienders_kenya": "0722 178 177"
    }

    return ResourceResponse(
        resources=resources,
        emergency_numbers=emergency_numbers
    )


@app.get("/translate")
async def translate_text(text: str, target: str = "sw"):
    """Auto-detect and translate text (cached for speed)"""
    cache_key = (text, target)
    if cache_key in cache:
        return {"cached": True, "translatedText": cache[cache_key]}

    try:
        result = translator.translate(text, dest=target)
        translation = result.text
        source_lang = result.src
        cache[cache_key] = translation
        return {
            "cached": False,
            "sourceLanguage": source_lang,
            "targetLanguage": target,
            "translatedText": translation
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Translation failed: {ex}")


@app.get("/api/incident")
@limiter.limit("100/hour")
async def get_incident_data(request: Request, db: Session = Depends(get_db)):
    """Get anonymized incident data for map visualization"""
    try:
        mappable_types = ["physical_violence", "sexual_violence", "harassment"]
        location_points = db.query(
            IncidentReport.latitude,
            IncidentReport.longitude,
            IncidentReport.incident_type,
            IncidentReport.county
        ).filter(
            IncidentReport.incident_type.in_(mappable_types),
            IncidentReport.latitude.isnot(None),
            IncidentReport.longitude.isnot(None)
        ).all()

        incidents = [
            {
                "lat": float(p.latitude),
                "lng": float(p.longitude),
                "type": p.incident_type,
                "county": p.county
            }
            for p in location_points
        ]

        return {
            "success": True,
            "data": {
                "incidents": incidents,
                "total": len(incidents),
                "last_updated": datetime.utcnow().isoformat()
            }
        }

    except Exception as e:
        logger.error(f"Error in incident data endpoint: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "data": {"incidents": []}
        }


@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    rasa_healthy = False
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{RASA_URL}/status", timeout=5.0)
            rasa_healthy = response.status_code == 200
    except:
        pass

    return {
        "status": "healthy",
        "nlp_loaded": nlp_engine is not None,
        "rasa_connected": rasa_healthy,
        "database": "sqlite",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("🚀 Vee Backend Starting...")
    logger.info("🧠 NLP Engine: Active")
    logger.info("🔒 Encryption: Enabled")
    logger.info("🌍 Translation: Active")
    logger.info("✅ Ready to serve")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)