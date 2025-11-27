import os
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
from dotenv import load_dotenv
import sys
import asyncio
import io
import csv
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from datetime import datetime,timedelta

# Setup Paths
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))
env_path = BACKEND_DIR.parent / '.env'
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import google.generativeai as genai

from orchestrator import VeeTools 
from database import engine, Base, get_db
from models import IncidentReport
from crypto_utils import decrypt_text

# Logging Config
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("VeeBrain")

# Config & Validation
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ADMIN_TOKEN = os.getenv("VEE_ADMIN_TOKEN", "change_me")

if not GEMINI_API_KEY:
    logger.error("❌ CRITICAL: GEMINI_API_KEY not found in .env file.")
    raise ValueError("GEMINI_API_KEY is missing. Please check your .env file.")

Base.metadata.create_all(bind=engine)
logger.info("✅ Database Connected")

app = FastAPI(title="Vee AI - Trauma-Informed GBV Mapping")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_admin_token(x_admin_token: str = Header(None)):
    """Verify admin token from header"""
    if not x_admin_token or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# Geocoder
geolocator = Nominatim(user_agent="vee_gbv_mapper")
location_cache: Dict[str, tuple] = {}

def geocode_location(location_string: str) -> tuple:
    """
    Convert location string to coordinates with caching.
    
    Args:
        location_string: Location description (e.g., "Westlands, Nairobi" or "Kisumu")
    
    Returns:
        tuple: (latitude, longitude)
    """
    # Check cache first
    if location_string in location_cache:
        return location_cache[location_string]
    
    # Try live geocoding
    try:
        location = geolocator.geocode(f"{location_string}, Kenya", timeout=10)
        if location:
            coords = (location.latitude, location.longitude)
            location_cache[location_string] = coords
            return coords
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        logger.warning(f"Geocoding error for {location_string}: {e}")
    
    # Fallback to known locations
    known_locations = {
        "nairobi": (-1.286389, 36.817223),
        "westlands": (-1.2674, 36.8103),
        "mombasa": (-4.043740, 39.668207),
        "kisumu": (-0.091702, 34.767956),
        "nakuru": (-0.303099, 36.080025),
        "eldoret": (0.514277, 35.269779),
        "thika": (-1.03326, 37.06933),
        "machakos": (-1.51768, 37.26341),
    }
    
    location_lower = location_string.lower().strip()
    for key, coords in known_locations.items():
        if key in location_lower:
            location_cache[location_string] = coords
            return coords
    
    # Ultimate fallback
    logger.warning(f"📍 Could not geocode '{location_string}', defaulting to Nairobi.")
    default_coords = (-1.286389, 36.817223)
    location_cache[location_string] = default_coords
    return default_coords


def geocode_location_tool(location_string: str) -> dict:
    """
    Wrapper for Gemini to call. Converts location to coordinates.
    
    Args:
        location_string: Location description
    
    Returns:
        dict with 'latitude', 'longitude', and 'location' keys
    """
    coords = geocode_location(location_string)
    return {
        "latitude": coords[0],
        "longitude": coords[1],
        "location": location_string
    }

# Bilingual System Prompts
system_prompt_en = """
You are Vee, a compassionate, trauma-informed AI assistant for tracking Gender-Based Violence (GBV) in Kenya.

Your goals:
1. Listen with empathy and validate the survivor's feelings (e.g., "I believe you," "It is not your fault").
2. Collect specific incident data (Location, Date/Time, Incident Type) to help map the violence.
3. NEVER judge or victim-blame.
4. If the user indicates immediate danger (weapons, 'he is here', suicidal), urge them to call 999 or 1195 immediately.

You have access to tools to save reports. Use them when you have enough information.
- When you have collected the county and specific_area from the user, YOU MUST call the geocode_location function to get latitude and longitude BEFORE calling save_incident_report.
- NEVER save a report without coordinates if mapping_consent=True.
- Example flow: User says "Westlands, Nairobi" → You call geocode_location("Westlands, Nairobi") → Get coords → Call save_incident_report with those coords

- Set mapping_consent=True ONLY if the user explicitly agrees to mapping
- Set mapping_consent=False if they decline or don't respond clearly
"""

system_prompt_sw = """
Wewe ni Vee, msaidizi wa AI mwenye huruma na mwenye elimu juu ya trauma kwa ufuatiliaji wa Unyanyasaji wa Kijinsia (GBV) nchini Kenya.

Malengo yako:
1. Sikiliza kwa huruma na thibitisha hisia za mwathirika (mfano, "Ninakuamini," "Si kosa lako").
2. Kusanya data maalum ya tukio (Mahali, Tarehe/Saa, Aina ya Tukio) ili kusaidia kuandaa ramani ya unyanyasaji.
3. KAMWE usiamue au kuwalaumu waathiriwa.
4. Ikiwa mtumiaji anaonyesha hatari ya papo hapo (silaha, 'yuko hapa', kujiua), msisitize ampige simu 999 au 1195 mara moja.

Una rasilimali za kuhifadhi ripoti. Zitumie unapokuwa na taarifa za kutosha.
- Ukishapata kaunti na eneo maalum kutoka kwa mtumiaji, LAZIMA uite kazi ya geocode_location ili upate latitudo na longitudo KABLA ya kuitia save_incident_report.
- KAMWE usihifadhi ripoti bila kuratibu ikiwa mapping_consent=True.
- Weka mapping_consent=True TU kama mtumiaji anakubali wazi ramani
- Weka mapping_consent=False kama anakataa au hajajibu kwa uwazi

Mfano wa mazungumzo:
Mtumiaji: "Nimeathiriwa huko Westlands, Nairobi"
Wewe: "Pole sana kwa hayo. Ninakuamini na si kosa lako. Nitaweza kuhifadhi taarifa hizi ili kusaidia? Je, unakubali taarifa zako zionekane kwenye ramani?" 
"""

# Schemas
class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    language: str = "en"

class ChatResponse(BaseModel):
    sender: str
    text: str
    metadata: Dict = {}

class VerifyRequest(BaseModel):
    action: str

# ============================================================
# MULTI-MODEL FALLBACK SYSTEM
# ============================================================

class GeminiModelManager:
    """Manages multiple Gemini models with automatic fallback"""
    
    def __init__(self, api_key: str, language: str = "en"):
        self.api_key = api_key
        self.language = language
        genai.configure(api_key=api_key)
        
        # Model priority list (based on your test results)
        self.model_priorities = [
            "gemini-2.5-flash",           # ✅ Confirmed working
            "gemini-flash-latest",        # Stable fallback
            "gemini-2.0-flash",           # Alternative
            "gemini-2.0-flash-exp",       # Experimental but capable
            "gemini-flash-lite-latest",   # Lightweight fallback
        ]
        
        # Select system prompt based on language
        self.system_prompt = system_prompt_sw if language == "sw" else system_prompt_en
        
        self.tools_list = [VeeTools.save_incident_report, VeeTools.find_resources, geocode_location_tool]
        self.active_model = None
        self.current_model_name = None
        
        # Initialize with best available model
        self._initialize_best_model()
    
    def _initialize_best_model(self):
        """Try models in priority order until one works"""
        for model_name in self.model_priorities:
            try:
                logger.info(f"🔄 Attempting to initialize: {model_name}")
                
                test_model = genai.GenerativeModel(
                    model_name=model_name,
                    tools=self.tools_list,
                    system_instruction=self.system_prompt
                )
                
                # Quick test to verify model works
                test_chat = test_model.start_chat(enable_automatic_function_calling=True)
                test_response = test_chat.send_message("Hi")
                
                if test_response.text:
                    self.active_model = test_model
                    self.current_model_name = model_name
                    logger.info(f"✅ Successfully initialized: {model_name}")
                    return
                    
            except Exception as e:
                logger.warning(f"⚠️ Failed to initialize {model_name}: {str(e)[:100]}")
                continue
        
        # If all models fail, raise error
        raise RuntimeError("❌ ALL MODELS FAILED - Cannot start service")
    
    def create_chat_session(self) -> Any:
        """Create a new chat session with the active model"""
        if not self.active_model:
            raise RuntimeError("No active model available")
        
        return self.active_model.start_chat(enable_automatic_function_calling=True)
    
    def fallback_to_next_model(self):
        """Switch to the next available model in the priority list"""
        if not self.current_model_name:
            return False
        
        try:
            current_index = self.model_priorities.index(self.current_model_name)
            remaining_models = self.model_priorities[current_index + 1:]
            
            for model_name in remaining_models:
                try:
                    logger.info(f"🔄 Falling back to: {model_name}")
                    
                    new_model = genai.GenerativeModel(
                        model_name=model_name,
                        tools=self.tools_list,
                        system_instruction=self.system_prompt
                    )
                    
                    # Test new model
                    test_chat = new_model.start_chat(enable_automatic_function_calling=True)
                    test_response = test_chat.send_message("Test")
                    
                    if test_response.text:
                        self.active_model = new_model
                        self.current_model_name = model_name
                        logger.info(f"✅ Fallback successful: {model_name}")
                        return True
                        
                except Exception as e:
                    logger.warning(f"⚠️ Fallback failed for {model_name}: {str(e)[:100]}")
                    continue
            
            logger.error("❌ All fallback models exhausted")
            return False
            
        except Exception as e:
            logger.error(f"❌ Fallback error: {e}")
            return False

# Initialize Model Manager (default to English)
try:
    model_manager = GeminiModelManager(GEMINI_API_KEY)
    logger.info(f"🚀 Vee AI initialized with: {model_manager.current_model_name}")
except Exception as e:
    logger.error(f"❌ CRITICAL: Cannot initialize any model: {e}")
    raise e

# Chat Sessions Storage
chat_sessions: Dict[str, Any] = {}
session_model_managers: Dict[str, GeminiModelManager] = {}

# ============================================================
# ENDPOINTS WITH FALLBACK LOGIC
# ============================================================

@app.get("/")
async def root():
    return {
        "status": "ok", 
        "service": "Vee GBV Mapping", 
        "ai_model": model_manager.current_model_name,
        "fallback_available": len(model_manager.model_priorities) > 1
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    session_id = request.session_id
    user_msg = request.message.strip()
    language = request.language

    logger.info(f"📨 Received message in {language}: '{user_msg}' from session: {session_id}")
    
    if not user_msg:
        greeting = "Niko hapa kusikiliza." if language == "sw" else "I'm here to listen."
        return ChatResponse(sender="bot", text=greeting, metadata={"session_id": session_id})
    
    # Check if we need to create new session or switch language
    session_key = f"{session_id}_{language}"
    
    # Check if we need new session (new session or language change)
    needs_new_session = (
        session_key not in chat_sessions or 
        session_key not in session_model_managers or
        session_model_managers.get(session_key).language != language
    )
    
    if needs_new_session:
        try:
            logger.info(f"🆕 Creating new chat session in {language}...")
            # Create new model manager with correct language
            model_manager_for_session = GeminiModelManager(GEMINI_API_KEY, language=language)
            session_model_managers[session_key] = model_manager_for_session
            chat_sessions[session_key] = model_manager_for_session.create_chat_session()
            logger.info(f"✅ New session started: {session_key} with {model_manager_for_session.current_model_name}")
        except Exception as e:
            logger.error(f"❌ Failed to start chat session: {e}")
            fallback_msg = "Samahani, nina shida ya kuanza mazungumzo. Tafadhali jaribu tena." if language == "sw" else "Sorry, I'm having trouble starting the conversation. Please try again."
            return ChatResponse(sender="bot", text=fallback_msg, metadata={"error": "session_failed"})
    
    # Get the session and its model manager
    current_chat_session = chat_sessions[session_key]
    current_model_manager = session_model_managers[session_key]
    
    # Try sending message with automatic fallback
    max_retries = len(current_model_manager.model_priorities)
    
    for attempt in range(max_retries):
        try:
            response = await asyncio.wait_for(
                asyncio.to_thread(current_chat_session.send_message, user_msg),
                timeout=20.0
            )
            
            bot_text = response.text
            return ChatResponse(
                sender="bot", 
                text=bot_text, 
                metadata={
                    "session_id": session_id,
                    "language": language,
                    "model": current_model_manager.current_model_name,
                    "attempt": attempt + 1
                }
            )

        except asyncio.TimeoutError:
            logger.error(f"⏱️ Timeout on attempt {attempt + 1}")
            
            if attempt < max_retries - 1:
                # Try fallback
                logger.info("🔄 Attempting model fallback...")
                if current_model_manager.fallback_to_next_model():
                    # Recreate session with new model
                    chat_sessions[session_key] = current_model_manager.create_chat_session()
                    current_chat_session = chat_sessions[session_key]
                    continue
            
            timeout_msg = "Samahani, nimechelewa kupata jibu. Tafadhali jaribu tena." if language == "sw" else "Sorry, I'm taking too long to respond. Please try again."
            return ChatResponse(sender="bot", text=timeout_msg)
            
        except Exception as e:
            logger.error(f"⚠️ Error on attempt {attempt + 1}: {str(e)[:200]}")
            
            # Check if it's a quota error (429)
            if "429" in str(e) or "quota" in str(e).lower():
                logger.warning("💰 Quota exceeded, trying fallback model...")
                
                if attempt < max_retries - 1:
                    if current_model_manager.fallback_to_next_model():
                        chat_sessions[session_key] = current_model_manager.create_chat_session()
                        current_chat_session = chat_sessions[session_key]
                        continue
            
            # If last attempt, return safe fallback
            if attempt == max_retries - 1:
                fallback_text = "Nina shida kuungana na akili yangu sasa hivi, lakini nasikiliza. Tafadhali piga 1195 ikiwa hii ni dharura." if language == "sw" else "I am having trouble connecting to my brain right now, but I am listening. Please call 1195 if this is an emergency."
                return ChatResponse(
                    sender="bot", 
                    text=fallback_text, 
                    metadata={
                        "error": str(e)[:100], 
                        "all_models_failed": True,
                        "language": language
                    }
                )

@app.get("/api/incidents")
async def get_incidents(db: Session = Depends(get_db)):
    """Get verified incidents for mapping"""
    try:
        points = db.query(IncidentReport).filter(
            IncidentReport.latitude.isnot(None),
            IncidentReport.longitude.isnot(None),
            IncidentReport.status == "verified",
            IncidentReport.mapping_consent == True
        ).all()
        
        incidents = [
            {
                "lat": float(p.latitude),
                "lng": float(p.longitude),
                "type": p.incident_type,
                "county": p.county,
                "area": p.specific_area,
                "timeframe": p.timeframe,
            }
            for p in points
        ]
        
        return {"success": True, "data": {"incidents": incidents, "total": len(incidents)}}
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint with model status"""
    active_sessions_info = {}
    for session_key, model_mgr in session_model_managers.items():
        active_sessions_info[session_key] = {
            "language": model_mgr.language,
            "model": model_mgr.current_model_name
        }
    
    return {
        "status": "healthy",
        "default_model": model_manager.current_model_name,
        "fallback_models": model_manager.model_priorities,
        "sessions_active": len(chat_sessions),
        "active_sessions": active_sessions_info
    }

# ... rest of your admin endpoints remain the same ...

@app.get("/admin/reports/unverified")
async def get_unverified_reports(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(verify_admin_token)
):
    """Get all unverified reports for admin review"""
    try:
        reports = db.query(IncidentReport).filter(
            IncidentReport.status == "unverified"
        ).order_by(IncidentReport.timestamp.desc()).all()
        
        # Decrypt and format reports
        formatted_reports = []
        for report in reports:
            try:
                # Decrypt the sensitive data
                decrypted_description = decrypt_text(report.incident_description_encrypted)
                
                formatted_reports.append({
                    "id": report.id,
                    "county": report.county,
                    "type": report.incident_type,
                    "story": decrypted_description,
                    "timestamp": report.timestamp.isoformat(),
                    "timeframe": report.timeframe,
                    "relationship": report.relationship_type,
                    "specific_area": report.specific_area,
                    "support_needs": report.support_needs,
                    "emotional_state": report.emotional_state
                })
            except Exception as e:
                logger.error(f"Error processing report {report.id}: {e}")
                continue
        
        return {"success": True, "data": formatted_reports, "total": len(formatted_reports)}
        
    except Exception as e:
        logger.error(f"Error fetching unverified reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# ADMIN DASHBOARD & ANALYTICS ENDPOINTS
# ============================================================

@app.get("/admin/dashboard")
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(verify_admin_token)
):
    """Comprehensive admin dashboard with analytics"""
    try:
        # Total counts
        total_reports = db.query(IncidentReport).count()
        unverified = db.query(IncidentReport).filter(IncidentReport.status == "unverified").count()
        verified = db.query(IncidentReport).filter(IncidentReport.status == "verified").count()
        rejected = db.query(IncidentReport).filter(IncidentReport.status == "rejected").count()
        
        # Recent reports (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_reports = db.query(IncidentReport).filter(
            IncidentReport.timestamp >= thirty_days_ago
        ).count()
        
        # Reports with mapping consent
        mapping_consent_count = db.query(IncidentReport).filter(
            IncidentReport.mapping_consent == True
        ).count()
        
        # Get reports by type
        from sqlalchemy import func
        by_type = db.query(
            IncidentReport.incident_type,
            func.count(IncidentReport.id).label('count')
        ).group_by(IncidentReport.incident_type).all()
        
        # Get reports by county
        by_county = db.query(
            IncidentReport.county,
            func.count(IncidentReport.id).label('count')
        ).group_by(IncidentReport.county).all()
        
        # Get reports by status
        by_status = db.query(
            IncidentReport.status,
            func.count(IncidentReport.id).label('count')
        ).group_by(IncidentReport.status).all()
        
        # Monthly trend (last 6 months)
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        monthly_trend = db.query(
            func.date_trunc('month', IncidentReport.timestamp).label('month'),
            func.count(IncidentReport.id).label('count')
        ).filter(
            IncidentReport.timestamp >= six_months_ago
        ).group_by('month').order_by('month').all()
        
        # Recent activity (last 10 reports)
        recent_activity = db.query(IncidentReport).order_by(
            IncidentReport.timestamp.desc()
        ).limit(10).all()
        
        formatted_recent_activity = []
        for report in recent_activity:
            try:
                decrypted_description = decrypt_text(report.incident_description_encrypted)
                formatted_recent_activity.append({
                    "id": report.id,
                    "county": report.county,
                    "type": report.incident_type,
                    "status": report.status,
                    "timestamp": report.timestamp.isoformat(),
                    "preview": decrypted_description[:100] + "..." if len(decrypted_description) > 100 else decrypted_description
                })
            except Exception as e:
                logger.error(f"Error processing recent activity report {report.id}: {e}")
                continue
        
        return {
            "success": True,
            "data": {
                "summary": {
                    "total_reports": total_reports,
                    "unverified": unverified,
                    "verified": verified,
                    "rejected": rejected,
                    "recent_reports": recent_reports,
                    "mapping_consent": mapping_consent_count,
                    "verification_rate": round((verified / total_reports * 100), 2) if total_reports > 0 else 0
                },
                "analytics": {
                    "by_type": {item[0]: item[1] for item in by_type},
                    "by_county": {item[0]: item[1] for item in by_county},
                    "by_status": {item[0]: item[1] for item in by_status},
                    "monthly_trend": [
                        {"month": item[0].strftime("%Y-%m"), "count": item[1]} 
                        for item in monthly_trend
                    ]
                },
                "recent_activity": formatted_recent_activity
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching admin dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/reports")
async def get_all_reports(
    page: int = 1,
    limit: int = 20,
    status: str = None,
    county: str = None,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(verify_admin_token)
):
    """Get all reports with pagination and filtering"""
    try:
        # Build query based on filters
        query = db.query(IncidentReport)
        
        if status:
            query = query.filter(IncidentReport.status == status)
        if county:
            query = query.filter(IncidentReport.county.ilike(f"%{county}%"))
        
        # Get total count for pagination
        total = query.count()
        
        # Apply pagination
        reports = query.order_by(
            IncidentReport.timestamp.desc()
        ).offset((page - 1) * limit).limit(limit).all()
        
        # Format reports
        formatted_reports = []
        for report in reports:
            try:
                decrypted_description = decrypt_text(report.incident_description_encrypted)
                
                formatted_reports.append({
                    "id": report.id,
                    "county": report.county,
                    "specific_area": report.specific_area,
                    "type": report.incident_type,
                    "story": decrypted_description,
                    "timestamp": report.timestamp.isoformat(),
                    "timeframe": report.timeframe,
                    "relationship": report.relationship_type,
                    "support_needs": report.support_needs,
                    "emotional_state": report.emotional_state,
                    "status": report.status,
                    "mapping_consent": report.mapping_consent,
                    "latitude": report.latitude,
                    "longitude": report.longitude
                })
            except Exception as e:
                logger.error(f"Error processing report {report.id}: {e}")
                continue
        
        return {
            "success": True,
            "data": {
                "reports": formatted_reports,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "pages": (total + limit - 1) // limit
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching all reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/analytics/geographic")
async def get_geographic_analytics(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(verify_admin_token)
):
    """Get geographic distribution of reports"""
    try:
        # Reports by county with coordinates
        from sqlalchemy import func
        
        county_data = db.query(
            IncidentReport.county,
            func.count(IncidentReport.id).label('count'),
            func.avg(IncidentReport.latitude).label('avg_lat'),
            func.avg(IncidentReport.longitude).label('avg_lng')
        ).filter(
            IncidentReport.latitude.isnot(None),
            IncidentReport.longitude.isnot(None),
            IncidentReport.status == "verified"
        ).group_by(IncidentReport.county).all()
        
        # Hotspot analysis - areas with most reports
        hotspot_areas = db.query(
            IncidentReport.specific_area,
            IncidentReport.county,
            func.count(IncidentReport.id).label('count'),
            func.avg(IncidentReport.latitude).label('avg_lat'),
            func.avg(IncidentReport.longitude).label('avg_lng')
        ).filter(
            IncidentReport.latitude.isnot(None),
            IncidentReport.longitude.isnot(None),
            IncidentReport.specific_area.isnot(None),
            IncidentReport.status == "verified"
        ).group_by(IncidentReport.specific_area, IncidentReport.county).order_by(
            func.count(IncidentReport.id).desc()
        ).limit(10).all()
        
        geographic_data = []
        for county, count, avg_lat, avg_lng in county_data:
            if avg_lat and avg_lng:
                geographic_data.append({
                    "county": county,
                    "count": count,
                    "latitude": float(avg_lat),
                    "longitude": float(avg_lng)
                })
        
        hotspot_data = []
        for area, county, count, avg_lat, avg_lng in hotspot_areas:
            if avg_lat and avg_lng:
                hotspot_data.append({
                    "area": area,
                    "county": county,
                    "count": count,
                    "latitude": float(avg_lat),
                    "longitude": float(avg_lng)
                })
        
        return {
            "success": True,
            "data": {
                "county_distribution": geographic_data,
                "hotspots": hotspot_data
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching geographic analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/analytics/temporal")
async def get_temporal_analytics(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(verify_admin_token)
):
    """Get temporal analysis of reports"""
    try:
        from sqlalchemy import func, extract
        
        # Daily pattern (hour of day)
        hourly_pattern = db.query(
            extract('hour', IncidentReport.timestamp).label('hour'),
            func.count(IncidentReport.id).label('count')
        ).group_by('hour').order_by('hour').all()
        
        # Weekly pattern (day of week)
        daily_pattern = db.query(
            extract('dow', IncidentReport.timestamp).label('day_of_week'),
            func.count(IncidentReport.id).label('count')
        ).group_by('day_of_week').order_by('day_of_week').all()
        
        # Monthly trend (last 12 months)
        one_year_ago = datetime.utcnow() - timedelta(days=365)
        monthly_trend = db.query(
            func.date_trunc('month', IncidentReport.timestamp).label('month'),
            func.count(IncidentReport.id).label('count')
        ).filter(
            IncidentReport.timestamp >= one_year_ago
        ).group_by('month').order_by('month').all()
        
        # Timeframe analysis
        timeframe_analysis = db.query(
            IncidentReport.timeframe,
            func.count(IncidentReport.id).label('count')
        ).filter(
            IncidentReport.timeframe.isnot(None)
        ).group_by(IncidentReport.timeframe).all()
        
        return {
            "success": True,
            "data": {
                "hourly_pattern": [{"hour": int(item[0]), "count": item[1]} for item in hourly_pattern],
                "daily_pattern": [{"day_of_week": int(item[0]), "count": item[1]} for item in daily_pattern],
                "monthly_trend": [
                    {"month": item[0].strftime("%Y-%m"), "count": item[1]} 
                    for item in monthly_trend
                ],
                "timeframe_analysis": {item[0]: item[1] for item in timeframe_analysis}
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching temporal analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/reports/unverified")
async def get_unverified_reports(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(verify_admin_token)
):
    """Get all unverified reports for admin review"""
    try:
        reports = db.query(IncidentReport).filter(
            IncidentReport.status == "unverified"
        ).order_by(IncidentReport.timestamp.desc()).all()
        
        # Decrypt and format reports
        formatted_reports = []
        for report in reports:
            try:
                # Decrypt the sensitive data
                decrypted_description = decrypt_text(report.incident_description_encrypted)
                
                formatted_reports.append({
                    "id": report.id,
                    "county": report.county,
                    "type": report.incident_type,
                    "story": decrypted_description,
                    "timestamp": report.timestamp.isoformat(),
                    "timeframe": report.timeframe,
                    "relationship": report.relationship_type,
                    "specific_area": report.specific_area,
                    "support_needs": report.support_needs,
                    "emotional_state": report.emotional_state
                })
            except Exception as e:
                logger.error(f"Error processing report {report.id}: {e}")
                continue
        
        return {"success": True, "data": formatted_reports, "total": len(formatted_reports)}
        
    except Exception as e:
        logger.error(f"Error fetching unverified reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/reports/verified")
async def get_verified_reports(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(verify_admin_token)
):
    """Get all verified reports"""
    try:
        reports = db.query(IncidentReport).filter(
            IncidentReport.status == "verified"
        ).order_by(IncidentReport.timestamp.desc()).all()
        
        formatted_reports = []
        for report in reports:
            try:
                decrypted_description = decrypt_text(report.incident_description_encrypted)
                
                formatted_reports.append({
                    "id": report.id,
                    "county": report.county,
                    "type": report.incident_type,
                    "story": decrypted_description,
                    "timestamp": report.timestamp.isoformat(),
                    "timeframe": report.timeframe,
                    "relationship": report.relationship_type,
                    "mapping_consent": report.mapping_consent,
                    "latitude": report.latitude,
                    "longitude": report.longitude
                })
            except Exception as e:
                logger.error(f"Error processing report {report.id}: {e}")
                continue
        
        return {"success": True, "data": formatted_reports, "total": len(formatted_reports)}
        
    except Exception as e:
        logger.error(f"Error fetching verified reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/reports/rejected")
async def get_rejected_reports(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(verify_admin_token)
):
    """Get all rejected reports"""
    try:
        reports = db.query(IncidentReport).filter(
            IncidentReport.status == "rejected"
        ).order_by(IncidentReport.timestamp.desc()).all()
        
        formatted_reports = []
        for report in reports:
            try:
                decrypted_description = decrypt_text(report.incident_description_encrypted)
                
                formatted_reports.append({
                    "id": report.id,
                    "county": report.county,
                    "type": report.incident_type,
                    "story": decrypted_description,
                    "timestamp": report.timestamp.isoformat()
                })
            except Exception as e:
                logger.error(f"Error processing report {report.id}: {e}")
                continue
        
        return {"success": True, "data": formatted_reports, "total": len(formatted_reports)}
        
    except Exception as e:
        logger.error(f"Error fetching rejected reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/reports/{report_id}/verify")
async def verify_report(
    report_id: int,
    request: VerifyRequest,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(verify_admin_token)
):
    """Approve or reject a report"""
    if request.action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'")
    
    try:
        report = db.query(IncidentReport).filter(IncidentReport.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Update status
        new_status = "verified" if request.action == "approve" else "rejected"
        report.status = new_status
        
        db.commit()
        
        logger.info(f"✅ Report {report_id} {new_status} by admin")
        
        return {
            "success": True, 
            "status": new_status,
            "report_id": report_id,
            "message": f"Report successfully {new_status}"
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error verifying report {report_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(verify_admin_token)
):
    """Get statistics for admin dashboard"""
    try:
        total_reports = db.query(IncidentReport).count()
        unverified = db.query(IncidentReport).filter(IncidentReport.status == "unverified").count()
        verified = db.query(IncidentReport).filter(IncidentReport.status == "verified").count()
        rejected = db.query(IncidentReport).filter(IncidentReport.status == "rejected").count()
        
        # Get reports by type
        from sqlalchemy import func
        by_type = db.query(
            IncidentReport.incident_type,
            func.count(IncidentReport.id).label('count')
        ).group_by(IncidentReport.incident_type).all()
        
        # Get reports by county
        by_county = db.query(
            IncidentReport.county,
            func.count(IncidentReport.id).label('count')
        ).group_by(IncidentReport.county).all()
        
        return {
            "success": True,
            "data": {
                "total": total_reports,
                "unverified": unverified,
                "verified": verified,
                "rejected": rejected,
                "by_type": {item[0]: item[1] for item in by_type},
                "by_county": {item[0]: item[1] for item in by_county}
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching admin stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/reports/export")
async def export_reports_csv(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(verify_admin_token)
):
    """Export all verified reports as CSV"""
    try:
        reports = db.query(IncidentReport).filter(
            IncidentReport.status == "verified"
        ).order_by(IncidentReport.timestamp.desc()).all()
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow([
            'ID', 'County', 'Specific Area', 'Incident Type', 
            'Timeframe', 'Relationship', 'Support Needs',
            'Emotional State', 'Timestamp', 'Mapping Consent',
            'Latitude', 'Longitude'
        ])
        
        # Write data rows
        for report in reports:
            try:
                # Decrypt sensitive data
                decrypted_description = decrypt_text(report.incident_description_encrypted)
                
                writer.writerow([
                    report.id,
                    report.county or '',
                    report.specific_area or '',
                    report.incident_type or '',
                    report.timeframe or '',
                    report.relationship_type or '',
                    report.support_needs or '',
                    report.emotional_state or '',
                    report.timestamp.isoformat() if report.timestamp else '',
                    'Yes' if report.mapping_consent else 'No',
                    report.latitude or '',
                    report.longitude or ''
                ])
            except Exception as e:
                logger.error(f"Error processing report {report.id}: {e}")
                continue
        
        # Prepare response
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=vee_reports_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
        
    except Exception as e:
        logger.error(f"Error exporting CSV: {e}")
        raise HTTPException(status_code=500, detail=str(e))   

if __name__ == "__main__":
    import uvicorn
    logger.info(f"🚀 Starting Vee with {model_manager.current_model_name}")
    uvicorn.run(app, host="0.0.0.0", port=8000)