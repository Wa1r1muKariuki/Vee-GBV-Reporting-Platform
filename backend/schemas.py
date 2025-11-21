# schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


# ================= ENUMS FOR DATA VALIDATION =================

class IncidentType(str, Enum):
    PHYSICAL_VIOLENCE = "physical_violence"
    SEXUAL_VIOLENCE = "sexual_violence"
    EMOTIONAL_ABUSE = "emotional_abuse"
    ECONOMIC_ABUSE = "economic_abuse"
    HARASSMENT = "harassment"
    STALKING = "stalking"
    ONLINE_GBV = "online_gbv"
    HARMFUL_PRACTICES = "harmful_practices"  # FGM, forced marriage
    OTHER = "other"


class RelationshipType(str, Enum):
    INTIMATE_PARTNER = "intimate_partner"
    EX_PARTNER = "ex_partner"
    FAMILY_MEMBER = "family_member"
    ACQUAINTANCE = "acquaintance"
    COLLEAGUE = "colleague"
    AUTHORITY_FIGURE = "authority_figure"  # boss, teacher, police
    STRANGER = "stranger"
    MULTIPLE_PERPETRATORS = "multiple_perpetrators"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class TimeframeType(str, Enum):
    HAPPENING_NOW = "happening_now"
    TODAY = "today"
    YESTERDAY = "yesterday"
    THIS_WEEK = "this_week"
    THIS_MONTH = "this_month"
    PAST_3_MONTHS = "past_3_months"
    PAST_6_MONTHS = "past_6_months"
    PAST_YEAR = "past_year"
    MORE_THAN_YEAR = "more_than_year"
    ONGOING = "ongoing"


class SupportNeed(str, Enum):
    IMMEDIATE_SAFETY = "immediate_safety"
    MEDICAL_CARE = "medical_care"
    LEGAL_ASSISTANCE = "legal_assistance"
    COUNSELING = "counseling"
    SHELTER = "shelter"
    POLICE_REPORT = "police_report"
    DOCUMENTATION = "documentation"
    SAFETY_PLANNING = "safety_planning"
    NONE_NOW = "none_now"


class ReportingBarrier(str, Enum):
    FEAR_OF_RETALIATION = "fear_of_retaliation"
    STIGMA = "stigma"
    DONT_TRUST_AUTHORITIES = "dont_trust_authorities"
    DONT_KNOW_HOW = "dont_know_how"
    ECONOMIC_DEPENDENCE = "economic_dependence"
    FAMILY_PRESSURE = "family_pressure"
    CULTURAL_NORMS = "cultural_norms"
    PREVIOUS_BAD_EXPERIENCE = "previous_bad_experience"
    OTHER = "other"


# ================= REQUEST/RESPONSE SCHEMAS =================

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = "anonymous"
    session_id: Optional[str] = None
    language: Optional[str] = "en"  # en or sw


class ChatResponse(BaseModel):
    sender: str
    text: str
    quick_replies: Optional[List[Dict[str, str]]] = []
    metadata: Optional[Dict] = {}
    

class IncidentRequest(BaseModel):
    """
    Core incident data - collected progressively through conversation
    """
    # What happened
    incident_type: Optional[IncidentType] = None
    incident_description: Optional[str] = None  # Will be encrypted
    
    # When
    timeframe: Optional[TimeframeType] = None
    is_ongoing: Optional[bool] = None
    is_first_time: Optional[bool] = None
    
    # Where
    county: Optional[str] = None
    subcounty: Optional[str] = None
    location_description: Optional[str] = None  # Will be encrypted
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Who (perpetrator)
    relationship_to_perpetrator: Optional[RelationshipType] = None
    perpetrator_count: Optional[int] = 1
    perpetrator_gender: Optional[str] = None  # male/female/other/unknown
    
    # Context
    reported_to_authorities: Optional[bool] = False
    reporting_barriers: Optional[List[ReportingBarrier]] = []
    previous_incidents: Optional[bool] = None
    
    # Support needs
    support_needs: Optional[List[SupportNeed]] = []
    needs_immediate_help: Optional[bool] = False
    
    # Metadata
    language_used: Optional[str] = "en"
    source: Optional[str] = "chat"  # chat, quick_form, sms
    consent_given: bool = True
    
    # Session info (not stored in DB)
    session_id: Optional[str] = None


class IncidentResponse(BaseModel):
    status: str
    message: str
    report_id: Optional[str] = None  # Encrypted ID
    resources: Optional[List[Dict]] = []
    next_steps: Optional[List[str]] = []


class ResourceRequest(BaseModel):
    county: Optional[str] = None
    support_type: Optional[SupportNeed] = None
    language: Optional[str] = "en"


class ResourceResponse(BaseModel):
    resources: List[Dict]
    emergency_numbers: Dict[str, str]


class SessionStatus(BaseModel):
    session_id: str
    progress: float  # 0.0 to 1.0
    last_stage: str
    can_continue: bool
    collected_data: Dict


class AnalyticsRequest(BaseModel):
    """For admin/NGO dashboard"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    county: Optional[str] = None
    incident_type: Optional[IncidentType] = None


class AnalyticsResponse(BaseModel):
    total_reports: int
    by_type: Dict[str, int]
    by_county: Dict[str, int]
    by_timeframe: Dict[str, int]
    temporal_trends: List[Dict]
    hotspots: List[Dict]  # Lat/long clusters
    support_gaps: Dict[str, int]  # Unmet needs by region