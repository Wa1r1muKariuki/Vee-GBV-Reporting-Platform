import logging
import json
import hashlib
from datetime import datetime
from sqlalchemy.orm import Session
from pathlib import Path

from database import SessionLocal
from models import IncidentReport
from crypto_utils import encrypt_text

logger = logging.getLogger("orchestrator")

# ============================================================
# LOAD GEONAMES DATA ON STARTUP
# ============================================================
GEONAMES_DATA = {}
LOCATION_CACHE = {}

def load_kenya_locations():
    """Load pre-processed GeoNames data"""
    global GEONAMES_DATA
    
    json_path = Path(__file__).parent / 'kenya_locations.json'
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            GEONAMES_DATA = json.load(f)
        logger.info(f"✅ Loaded {len(GEONAMES_DATA)} Kenya locations from GeoNames")
    except FileNotFoundError:
        logger.warning("⚠️ kenya_locations.json not found, using fallback database")
        GEONAMES_DATA = {}
    except Exception as e:
        logger.error(f"❌ Error loading GeoNames: {e}")
        GEONAMES_DATA = {}

# Load on module import
load_kenya_locations()

# Fallback county centers
COUNTY_CENTERS = {
    "nairobi": (-1.286389, 36.817223),
    "nakuru": (-0.303099, 36.080025),
    "mombasa": (-4.043740, 39.668207),
    "kisumu": (-0.091702, 34.767956),
    "uasin gishu": (0.514277, 35.269779),
    "eldoret": (0.514277, 35.269779),
    "machakos": (-1.51768, 37.26341),
    "kajiado": (-1.8524, 36.7820),
    "kiambu": (-1.1714, 36.8356),
    "meru": (0.0469, 37.6502),
    "kakamega": (0.2827, 34.7519),
}

def geocode_location_internal(location_string: str, county: str = None) -> tuple:
    """
    Geocode using GeoNames database with intelligent fallbacks.
    
    Priority:
    1. Check cache
    2. Exact match in GeoNames
    3. Partial match in GeoNames
    4. County center fallback
    5. Nairobi default
    """
    # Check cache
    cache_key = f"{location_string}_{county}".lower()
    if cache_key in LOCATION_CACHE:
        return LOCATION_CACHE[cache_key]
    
    query = location_string.lower().strip()
    
    # Try exact match
    if query in GEONAMES_DATA:
        loc = GEONAMES_DATA[query]
        coords = (loc['lat'], loc['lon'])
        logger.info(f"✅ Exact match: {location_string} -> {coords}")
        LOCATION_CACHE[cache_key] = coords
        return coords
    
    # Try partial match (search for query in location names)
    matches = []
    for loc_name, loc_data in GEONAMES_DATA.items():
        if query in loc_name or loc_name in query:
            matches.append((loc_name, loc_data))
    
    if matches:
        # Sort by population (prefer larger cities)
        matches.sort(key=lambda x: x[1].get('population', 0), reverse=True)
        best_match = matches[0]
        coords = (best_match[1]['lat'], best_match[1]['lon'])
        logger.info(f"✅ Partial match: {location_string} -> {best_match[0]} -> {coords}")
        LOCATION_CACHE[cache_key] = coords
        return coords
    
    # Try county center fallback
    if county:
        county_lower = county.lower().strip()
        if county_lower in COUNTY_CENTERS:
            coords = COUNTY_CENTERS[county_lower]
            logger.warning(f"⚠️ Using county center: {county} -> {coords}")
            LOCATION_CACHE[cache_key] = coords
            return coords
        
        # Try searching county name in GeoNames
        if county_lower in GEONAMES_DATA:
            loc = GEONAMES_DATA[county_lower]
            coords = (loc['lat'], loc['lon'])
            logger.warning(f"⚠️ Using county location: {county} -> {coords}")
            LOCATION_CACHE[cache_key] = coords
            return coords
    
    # Ultimate fallback to Nairobi
    logger.warning(f"⚠️ No match for '{location_string}', defaulting to Nairobi")
    default = (-1.286389, 36.817223)
    LOCATION_CACHE[cache_key] = default
    return default


class VeeTools:
    """Tools for Gemini - Trauma-informed data collection for GBV mapping"""

    @staticmethod
    def save_incident_report(
        county: str,
        incident_type: str,
        incident_description: str,
        timeframe: str = "Unknown",
        specific_area: str = None,
        relationship_type: str = "Unknown",
        latitude: float = None,
        longitude: float = None,
        mapping_consent: bool = False,
        support_needs: str = None,
        emotional_state: str = None,
        session_id: str = None
    ):
        """
        Save GBV incident with coordinates for mapping.
        Auto-geocodes using GeoNames database.
        """
        db: Session = SessionLocal()
        
        try:
            logger.info(f"💾 Saving: {incident_type} in {county}, mapping={mapping_consent}")
            
            # Validate
            if not incident_description or len(incident_description.strip()) < 10:
                return {"success": False, "message": "Need more details before saving."}
            
            # AUTO-GEOCODING with GeoNames
            if mapping_consent and (latitude is None or longitude is None):
                location_str = f"{specific_area}, {county}" if specific_area else county
                logger.info(f"🗺️ Auto-geocoding: {location_str}")
                
                try:
                    coords = geocode_location_internal(location_str, county=county)
                    latitude = coords[0]
                    longitude = coords[1]
                    logger.info(f"✅ Will map at: ({latitude}, {longitude})")
                except Exception as e:
                    logger.error(f"❌ Geocoding failed: {e}")
                    latitude = None
                    longitude = None
                    mapping_consent = False
            
            # Hash for deduplication
            unique_string = f"{session_id}_{county}_{datetime.utcnow().isoformat()}"
            report_id_hash = hashlib.sha256(unique_string.encode()).hexdigest()
            
            # Encrypt sensitive data
            enc_description = encrypt_text(incident_description)
            enc_location = encrypt_text(f"{specific_area}, {county}" if specific_area else county)
            
            # Normalize type
            incident_type_normalized = incident_type.lower().replace(" ", "_")
            
            # Auto-verify serious violence
            auto_verify_types = [
                'physical_violence', 'sexual_violence', 
                'physical_assault', 'physical_abuse',
                'sexual_assault', 'rape', 'femicide', 
                'attempted_murder', 'assault', 'attack',
                'domestic_violence', 'domestic_abuse',
                'abuse', 'slap', 'hit', 'beat', 'punch', 'kick'
            ]
            
            should_auto_verify = any(verify_type in incident_type_normalized for verify_type in auto_verify_types)
            
            if should_auto_verify:
                status = "verified"
                auto_verified = True
                logger.info(f"🟢 Auto-verified: {incident_type_normalized}")
            else:
                status = "unverified"
                auto_verified = False
                logger.info(f"🟡 Needs review: {incident_type_normalized}")
            
            # Create report
            report = IncidentReport(
                report_id_hash=report_id_hash,
                session_id=session_id,
                incident_description_encrypted=enc_description,
                location_description_encrypted=enc_location,
                county=county,
                specific_area=specific_area,
                incident_type=incident_type_normalized,
                timeframe=timeframe,
                relationship_type=relationship_type,
                latitude=latitude if mapping_consent else None,
                longitude=longitude if mapping_consent else None,
                mapping_consent=mapping_consent,
                support_needs=support_needs,
                emotional_state=emotional_state,
                consent_given=True,
                status=status,
                timestamp=datetime.utcnow()
            )
            
            db.add(report)
            db.commit()
            db.refresh(report)
            
            if auto_verified:
                if mapping_consent and latitude and longitude:
                    msg = f"Your report is verified and will appear on the map at {specific_area or county}."
                else:
                    msg = "Your report is verified but will be kept private (not shown on map)."
            else:
                msg = "Your report is saved and will be reviewed shortly."
            
            logger.info(f"✅ Saved report ID {report.id} | Coords: ({latitude}, {longitude}) | Status: {status}")
            
            return {
                "success": True,
                "report_id": str(report.id),
                "auto_verified": auto_verified,
                "mapped": (mapping_consent and latitude is not None),
                "message": msg
            }
            
        except Exception as e:
            logger.error(f"❌ Error saving report: {e}")
            db.rollback()
            return {"success": False, "message": "Trouble saving. Your info is safe with me."}
        finally:
            db.close()

    @staticmethod
    def find_resources(county: str, support_needs: str = "all"):
        """Find support resources by location"""
        logger.info(f"🔍 Finding resources in {county}")
        
        resources_db = {
            "nairobi": {
                "medical": [
                    "Nairobi Women's Hospital - GBV Unit: 0733 123 456",
                    "Kenyatta National Hospital: 0726 478 000"
                ],
                "legal": [
                    "FIDA Kenya: 0721 234 567",
                    "Legal Aid Nairobi: 0722 345 678"
                ],
                "counseling": [
                    "LVCT Health: 1190",
                    "Kenya Red Cross: 1199"
                ],
                "police": [
                    "Gender Desk - Central: 0723 456 789"
                ]
            },
            "mombasa": {
                "medical": ["Coast General Hospital: 0734 567 890"],
                "legal": ["Mombasa Women's Rights: 0723 456 789"],
                "counseling": ["Coast Mental Health: 0712 345 678"]
            },
            "kisumu": {
                "medical": ["Kisumu County Hospital: 0712 345 678"],
                "legal": ["Legal Aid Kisumu: 0734 567 890"]
            }
        }
        
        county_lower = county.lower()
        county_resources = resources_db.get(county_lower, {})
        
        if not county_resources:
            return [
                "\n📞 National GBV Helpline: 1195 (24/7, toll-free)",
                "📞 Emergency Police: 999",
                "📞 Childline: 116"
            ]
        
        result = [f"\n**Support in {county.title()}:**\n"]
        
        if support_needs == "all":
            for category, contacts in county_resources.items():
                result.append(f"\n**{category.title()}:**")
                for contact in contacts:
                    result.append(f"  • {contact}")
        else:
            contacts = county_resources.get(support_needs, [])
            if contacts:
                result.append(f"\n**{support_needs.title()}:**")
                for contact in contacts:
                    result.append(f"  • {contact}")
        
        result.append("\n**National Emergency:**")
        result.append("  • GBV Helpline: 1195 (24/7)")
        result.append("  • Emergency Police: 999")
        
        return result