#!/usr/bin/env python3
"""
Test database connection and queries
"""

import os
import sys
from pathlib import Path

# Add backend to path
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from database import engine, SessionLocal
from models import IncidentReport
from sqlalchemy import inspect, text

print("🔍 Testing database connection...")

# Test 1: Check if tables exist
try:
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"✅ Tables found: {tables}")
    
    if 'incident_reports' in tables:
        print("✅ 'incident_reports' table exists")
        
        # Test 2: Check table structure
        columns = inspector.get_columns('incident_reports')
        print(f"📊 Table has {len(columns)} columns")
        
        # Test 3: Try a simple query
        db = SessionLocal()
        try:
            count = db.query(IncidentReport).count()
            print(f"📈 Total reports in database: {count}")
            
            # Test 4: Try the unverified query specifically
            unverified_count = db.query(IncidentReport).filter(IncidentReport.status == "unverified").count()
            print(f"📋 Unverified reports: {unverified_count}")
            
        except Exception as e:
            print(f"❌ Query failed: {e}")
        finally:
            db.close()
            
    else:
        print("❌ 'incident_reports' table NOT found")
        
except Exception as e:
    print(f"❌ Database inspection failed: {e}")

print("\n🧪 Testing raw SQL query...")
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM incident_reports WHERE status = 'unverified'"))
        count = result.scalar()
        print(f"✅ Raw SQL query successful: {count} unverified reports")
except Exception as e:
    print(f"❌ Raw SQL query failed: {e}")