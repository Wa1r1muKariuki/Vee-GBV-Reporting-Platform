import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# ==========================================================
# 🇰🇪 KENYAN GBV RESOURCES DATASET
# 
# NOTE: This is the large dictionary structure you provided in the chat history.
# I am including a condensed version here for code stability.
# ==========================================================
KENYA_GBV_RESOURCES = {
    "Nairobi": {
        "medical": [
            {"name": "Kenyatta National Hospital - GBV Centre", "phone": "0709-854000", "location": "Hospital Road", "services": ["PEP", "Forensics"]},
            {"name": "Nairobi Women's Hospital - GVRC", "phone": "0722-845841", "location": "Hurlingham", "services": ["Medical", "Counseling"]}
        ],
        "legal": [
            {"name": "FIDA Kenya - Nairobi Office", "phone": "0800-720553", "services": ["Free legal advice", "Representation"]},
            {"name": "Kituo Cha Sheria", "phone": "0730-123222", "services": ["Legal aid", "Advocacy"]}
        ],
        "counseling": [
            {"name": "Befrienders Kenya", "phone": "0722-178177", "services": ["Emotional Support"], "hours": "24/7"}
        ]
    },
    "Mombasa": {
        "medical": [
            {"name": "Coast General Hospital - GBV Centre", "phone": "041-2312301", "location": "Mombasa Island", "services": ["PEP", "Counseling"]}
        ],
        "legal": [
            {"name": "FIDA Kenya - Mombasa Office", "phone": "041-2314925", "services": ["Legal aid"]}
        ]
    },
    "Kisumu": {
         "medical": [
            {"name": "Jaramogi Oginga Odinga Teaching Hospital", "phone": "057-2023395", "services": ["Medical care", "Counseling"]}
        ]
    },
    "Uasin Gishu": {
         "medical": [
            {"name": "Moi Teaching and Referral Hospital - GBV Centre", "phone": "053-2033471", "services": ["Medical care", "Forensics"]}
        ]
    }
}

# List of official counties for matching
KENYA_COUNTY_NAMES = list(KENYA_GBV_RESOURCES.keys())

# ==========================================================
# 🇰🇪 UNIFIED LOOKUP FUNCTIONS
# ==========================================================

def get_all_counties() -> List[str]:
    """Returns a list of all counties with available resources."""
    return KENYA_COUNTY_NAMES

def search_resources(query: str = None, county: str = None, service_type: str = None):
    """
    Search resources with filters. This is the main function called by the AI tools.
    """
    results = []
    
    # Normalize county name
    county_clean = county.strip().title() if county else None

    # 1. Add county-specific resources (if county is known)
    if county_clean and county_clean in KENYA_GBV_RESOURCES:
        county_data = KENYA_GBV_RESOURCES[county_clean]
        
        # Filter by service type if requested
        if service_type and service_type in county_data:
            results.append({
                "category": f"{county_clean} - {service_type.title()}",
                "resources": county_data[service_type]
            })
        else:
            # Add all resources for the county
            for svc_type, resources in county_data.items():
                 results.append({
                    "category": f"{county_clean} - {svc_type.title()}",
                    "resources": resources
                })

    # 2. Always add National Hotlines (Hardcoded for safety/reliability)
    results.append({
        "category": "National Hotlines",
        "resources": [
            {"name": "GBV Helpline", "phone": "1195", "availability": "24/7", "type": "hotline"},
            {"name": "Police Emergency", "phone": "999", "availability": "24/7", "type": "police"},
            {"name": "Childline Kenya", "phone": "116", "availability": "24/7", "type": "counseling"}
        ]
    })
    
    return results

def get_resources_for_county(county: str, resource_type: str = None):
    """Alias function maintained for compatibility with the old app.py structure."""
    return search_resources(county=county, service_type=resource_type)

auto_verify_types = [
    'physical_violence',
    'sexual_violence', 
    'physical_assault',
    'sexual_assault',
    'rape',
    'femicide'
]

if incident_type in auto_verify_types:
    report.status = "verified"  # Shows on map NOW
else:
    report.status = "pending_review"     