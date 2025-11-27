# models.py - Rewritten to fix NameError and Base conflict

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
# 1. ✅ FIX: Import 'datetime' class from the 'datetime' module
from datetime import datetime 
# 2. ✅ FIX: REMOVE the declarative_base import, it's not needed here
# from sqlalchemy.ext.declarative import declarative_base
# 3. ✅ VITAL: Import the single, shared Base from database.py
from database import Base 

# 4. ✅ FIX: REMOVE this line which causes the database connection conflict
# Base = declarative_base() 

class IncidentReport(Base):
    __tablename__ = "incident_reports"
    
    # Primary Key & Identification
    id = Column(Integer, primary_key=True, index=True)
    report_id_hash = Column(String(64), unique=True, index=True) 
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
    # This now works because 'datetime' is imported above
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
    # This also now works
    date = Column(DateTime, default=datetime.utcnow)
    county = Column(String(50), index=True)
    incident_type = Column(String(50), index=True)
    count = Column(Integer, default=0)
    support_gap_score = Column(Float)