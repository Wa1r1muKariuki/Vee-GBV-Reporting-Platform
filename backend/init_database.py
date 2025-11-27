#!/usr/bin/env python3
"""
Database initialization script for Vee AI
Run this to create all necessary tables
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from database import fresh_start, init_db, test_connection
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("init_db")

def main():
    print("🚀 Vee AI Database Initialization")
    print("=" * 50)
    
    # Option 1: Fresh start (deletes everything)
    # Option 2: Just create tables if they don't exist
    
    choice = input("\nChoose option:\n1. Fresh start (DELETE ALL DATA)\n2. Create tables only\n3. Test connection only\n\nEnter choice (1/2/3): ").strip()
    
    if choice == "1":
        fresh_start()
    elif choice == "2":
        print("\n🔨 Creating tables...")
        init_db()
        if test_connection():
            print("✅ Tables created successfully!")
        else:
            print("❌ Failed to create tables")
    elif choice == "3":
        if test_connection():
            print("✅ Database connection successful!")
        else:
            print("❌ Database connection failed")
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main()