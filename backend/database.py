import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import logging

# Load environment variables
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database")

# Database URL configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vee_ai.db")

# Fix PostgreSQL URL format
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Engine configuration
if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True
    )

# Session & Base
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for FastAPI endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables checked/created successfully")

# ============================================================
# FRESH START FUNCTION (Moved from separate script)
# ============================================================

def fresh_start():
    """Drop and recreate all tables with correct schema"""
    
    print("\n" + "="*60)
    print("⚠️  FRESH DATABASE START - ALL DATA WILL BE DELETED")
    print("="*60)
    confirm = input("\nType 'YES DELETE EVERYTHING' to confirm: ")
    
    if confirm != "YES DELETE EVERYTHING":
        logger.info("❌ Operation cancelled")
        return
    
    logger.info("\n🗑️  Dropping all tables...")
    
    with engine.begin() as conn:
        # Drop tables
        conn.execute(text("DROP TABLE IF EXISTS incident_reports CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS aggregated_statistics CASCADE"))
        logger.info("✅ Tables dropped")
    
    # Now import models and recreate
    logger.info("\n🔨 Creating fresh tables with correct schema...")
    
    # Import models AFTER Base is defined
    from models import Base as ModelsBase
    ModelsBase.metadata.create_all(bind=engine)
    
    logger.info("✅ Fresh tables created!")
    
    # Verify schema
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('incident_reports')]
    
    logger.info(f"\n📊 Created columns ({len(columns)}):")
    for col in sorted(columns):
        logger.info(f"   ✓ {col}")
    
    logger.info("\n" + "="*60)
    logger.info("✅ Database is fresh and ready!")
    logger.info("🚀 You can now restart your backend server")
    logger.info("="*60)

# Run fresh_start if this file is executed directly
if __name__ == "__main__":
    fresh_start()