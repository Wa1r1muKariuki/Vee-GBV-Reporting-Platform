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

# Database URL configuration - FORCE SQLITE FOR LOCAL DEVELOPMENT
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vee_ai.db")

# Always use SQLite for local development to avoid school WiFi blocks
if not os.getenv("ENVIRONMENT") == "production":
    DATABASE_URL = "sqlite:///./vee_local.db"
    logger.info("🔧 Using SQLite for local development")

# Fix PostgreSQL URL format (for production only)
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Engine configuration
if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False},
        echo=False  # Set to True for SQL debugging
    )
    logger.info(f"✅ SQLite database initialized: {DATABASE_URL}")
else:
    # PostgreSQL configuration (for production)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        echo=False
    )
    logger.info("✅ PostgreSQL database configured")

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
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables checked/created successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        # Don't raise error - allow app to start without database
        logger.info("🔄 Continuing with limited functionality...")

def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Database connection test: SUCCESS")
        return True
    except Exception as e:
        logger.error(f"❌ Database connection test: FAILED - {e}")
        return False

# ============================================================
# FRESH START FUNCTION
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
    
    try:
        with engine.begin() as conn:
            # Get all table names
            if "sqlite" in DATABASE_URL:
                # SQLite approach
                tables = conn.execute(text("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name NOT LIKE 'sqlite_%'
                """)).fetchall()
                for table in tables:
                    conn.execute(text(f"DROP TABLE IF EXISTS {table[0]}"))
            else:
                # PostgreSQL approach
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
        tables = inspector.get_table_names()
        
        logger.info(f"\n📊 Created tables ({len(tables)}):")
        for table in sorted(tables):
            columns = [col['name'] for col in inspector.get_columns(table)]
            logger.info(f"   📋 {table} ({len(columns)} columns)")
            for col in sorted(columns):
                logger.info(f"      ✓ {col}")
        
        logger.info("\n" + "="*60)
        logger.info("✅ Database is fresh and ready!")
        logger.info("🚀 You can now restart your backend server")
        logger.info("="*60)
        
    except Exception as e:
        logger.error(f"❌ Error during fresh start: {e}")
        logger.info("💡 Try running: python database.py to reset database")

# Run fresh_start if this file is executed directly
if __name__ == "__main__":
    fresh_start()