# models.py
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class IncidentReport(Base):
    __tablename__ = "incident_reports"
    
    # Non-sensitive metadata
    id = Column(Integer, primary_key=True, index=True)
    report_id_hash = Column(String(64), unique=True, index=True)  # For deduplication
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # ENCRYPTED FIELDS (store as TEXT)
    incident_description_encrypted = Column(Text, nullable=True)
    location_description_encrypted = Column(Text, nullable=True)
    perpetrator_description_encrypted = Column(Text, nullable=True)
    
    # Anonymized categorical data (for analysis)
    county = Column(String(50), index=True, nullable=True)
    incident_type = Column(String(50), index=True, nullable=False)
    timeframe = Column(String(50), index=True, nullable=True)
    relationship_type = Column(String(50), index=True, nullable=True)
    
    # Support tracking
    support_needs = Column(String(200), nullable=True)  # JSON string
    reporting_barriers = Column(String(200), nullable=True)  # JSON string
    reported_to_authorities = Column(Boolean, default=False)
    
    # Geospatial (randomized within county for privacy)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_accuracy_km = Column(Float, default=5.0)  # ±5km
    
    # Metadata
    language = Column(String(10), default='en')
    source = Column(String(20), default='chat')
    status = Column(String(20), default='unverified', index=True)
    
    # NO USER IDENTIFIERS
    # session_hash: one-way hash for session continuity, not reversible


class AggregatedStatistics(Base):
    """Pre-computed aggregate stats for public access"""
    __tablename__ = "aggregated_statistics"
    
    id = Column(Integer, primary_key=True)
    date = Column(DateTime, default=datetime.utcnow)
    county = Column(String(50), index=True)
    incident_type = Column(String(50), index=True)
    count = Column(Integer, default=0)
    support_gap_score = Column(Float)  # Calculated metric