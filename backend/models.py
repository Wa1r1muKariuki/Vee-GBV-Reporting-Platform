from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import base64

Base = declarative_base()

class IncidentReport(Base):
    __tablename__ = "incident_reports"
    
    # Primary Key & Identification
    id = Column(Integer, primary_key=True, index=True)
    report_id_hash = Column(String(64), unique=True, index=True)  # FIXED: Changed from report_hash
    session_id = Column(String(255), index=True)
    
    # Core Incident Data (Encrypted)
    incident_description_encrypted = Column(Text)
    location_description_encrypted = Column(Text)
    perpetrator_description_encrypted = Column(Text, nullable=True)
    
    # Categorical Data (For Analysis)
    county = Column(String(100), index=True)
    specific_area = Column(String(200))
    incident_type = Column(String(100), index=True)
    timeframe = Column(String(100))
    relationship_type = Column(String(100))
    emotional_state = Column(String(100))
    support_needs = Column(String(500))
    
    # Consent & Mapping
    consent_given = Column(Boolean, default=False)
    mapping_consent = Column(Boolean, default=False)
    latitude = Column(Float)
    longitude = Column(Float)
    location_accuracy_km = Column(Float, default=5.0)
    
    # Status & Verification
    status = Column(String(50), default="unverified", index=True)
    
    # Metadata
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    language = Column(String(10), default='en')
    source = Column(String(20), default='chat')
    
    # Reporting History
    reported_to_authorities = Column(Boolean, default=False)
    reporting_barriers = Column(String(500), nullable=True)

class AggregatedStatistics(Base):
    """Pre-computed aggregate stats for public access"""
    __tablename__ = "aggregated_statistics"
    
    id = Column(Integer, primary_key=True)
    date = Column(DateTime, default=datetime.utcnow)
    county = Column(String(50), index=True)
    incident_type = Column(String(50), index=True)
    count = Column(Integer, default=0)
    support_gap_score = Column(Float)