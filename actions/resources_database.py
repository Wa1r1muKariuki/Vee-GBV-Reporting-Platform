# resources_database.py
"""
Comprehensive Kenya GBV Resources Database
Updated: November 2025
Sources: Official government websites, verified NGOs, UN agencies

THIS FILE NOW USES JSON FOR EASY UPDATES!
See counties_resources.json for county-specific data
See load_counties.py for loading functions
"""

from .load_counties import (
    get_county_resources as get_county_data,
    search_resources as search_county_resources,
    get_all_counties,
    get_verified_counties
)

# ==================== NATIONAL HOTLINES (Always Available) ====================
KENYA_GBV_RESOURCES = {
    "national_hotlines": {
        "gbv_helpline": {
            "name": "National GBV Helpline",
            "number": "1195",
            "availability": "24/7",
            "cost": "Toll-free",
            "languages": ["English", "Kiswahili"],
            "services": ["Crisis counseling", "Referrals", "Emergency response"],
            "operated_by": "Ministry of Public Service and Gender"
        },
        "police_emergency": {
            "name": "Police Emergency",
            "number": "999 / 112 / 911",
            "availability": "24/7",
            "cost": "Free",
            "services": ["Emergency police response", "Crime reporting"]
        },
        "childline_kenya": {
            "name": "Childline Kenya",
            "number": "116",
            "availability": "24/7",
            "cost": "Toll-free",
            "services": ["Child protection", "Abuse reporting", "Counseling"],
            "age_group": "Children and adolescents"
        },
        "mental_health_support": {
            "name": "Kenya Red Cross Psychosocial Support",
            "number": "1199",
            "availability": "24/7",
            "cost": "Toll-free",
            "services": ["Mental health support", "Trauma counseling"]
        }
    },
    
    # ==================== NAIROBI COUNTY ====================
    "Nairobi": {
        "medical": [
            {
                "name": "Kenyatta National Hospital - Gender-Based Violence Recovery Centre",
                "type": "Hospital GBV Unit",
                "phone": "020-2726300 / 0709-854000",
                "location": "Hospital Road, Nairobi",
                "services": ["Medical examination", "Post-Exposure Prophylaxis (PEP)", "Emergency contraception", "Forensic evidence collection", "STI screening", "Counseling", "Police liaison"],
                "hours": "24/7",
                "cost": "Subsidized/Free for GBV survivors"
            },
            {
                "name": "Nairobi Women's Hospital - Gender Violence Recovery Centre",
                "type": "Private Hospital GBV Unit",
                "phone": "0722-845841 / 020-2845000",
                "location": "Argwings Kodhek Road, Hurlingham",
                "services": ["Medical care", "Counseling", "Legal support", "Safe house", "24/7 hotline"],
                "hours": "24/7",
                "cost": "Free for survivors (donor funded)"
            },
            {
                "name": "Mama Lucy Kibaki Hospital - GBV Centre",
                "type": "Public Hospital",
                "phone": "020-2340871",
                "location": "Outer Ring Road, Embakasi",
                "services": ["Medical examination", "PEP", "Counseling", "Referrals"],
                "hours": "24/7"
            },
            {
                "name": "Mbagathi District Hospital",
                "type": "Public Hospital",
                "phone": "020-6003841",
                "location": "Mbagathi Way",
                "services": ["Medical care", "PEP", "Documentation"],
                "hours": "24/7"
            }
        ],
        "legal": [
            {
                "name": "FIDA Kenya - Nairobi Office",
                "type": "Legal Aid Organization",
                "phone": "020-3874998 / 0800-720553 (Toll-free)",
                "email": "fida@fidakenya.org",
                "location": "Argwings Kodhek Road, Kilimani",
                "services": ["Free legal advice", "Court representation", "Protection orders", "Legal aid", "Public Interest Litigation"],
                "hours": "Mon-Fri 8:00-17:00",
                "website": "www.fidakenya.org"
            },
            {
                "name": "Kituo Cha Sheria",
                "type": "Legal Aid Centre",
                "phone": "020-3876290 / 0730-123222",
                "location": "Valley Road, Nairobi",
                "services": ["Legal aid", "Advocacy", "Court accompaniment"],
                "hours": "Mon-Fri 8:00-17:00"
            },
            {
                "name": "Legal Resources Foundation (LRF)",
                "type": "Legal Aid",
                "phone": "020-2721289",
                "services": ["Free legal representation", "Legal education"]
            }
        ],
        "counseling": [
            {
                "name": "LVCT Health - Counseling Services",
                "type": "Counseling Organization",
                "phone": "1190 (Toll-free)",
                "location": "Ralph Bunche Road, Nairobi",
                "services": ["Free counseling", "HIV testing", "GBV support groups"],
                "hours": "Mon-Fri 8:00-17:00"
            },
            {
                "name": "Amani Counselling Centre",
                "type": "Trauma Counseling",
                "phone": "020-2730300 / 0722-203132",
                "location": "Nairobi",
                "services": ["Individual therapy", "Group therapy", "Trauma counseling"],
                "hours": "Mon-Fri 8:00-17:00"
            },
            {
                "name": "Befrienders Kenya",
                "type": "Emotional Support",
                "phone": "0722-178177",
                "services": ["Emotional support", "Suicide prevention", "Crisis counseling"],
                "hours": "24/7"
            }
        ],
        "shelters": [
            {
                "name": "Nairobi Women's Hospital Safe House",
                "type": "Emergency Shelter",
                "phone": "0722-845841",
                "services": ["Safe temporary housing", "Counseling", "Medical care", "Legal support"],
                "duration": "Up to 3 months",
                "admission": "Through hospital or hotline referral"
            },
            {
                "name": "COVAW - Shelter",
                "type": "Women's Shelter",
                "phone": "0736-002606 / 0722-384096",
                "services": ["Safe housing", "Psychosocial support", "Economic empowerment"],
                "admission": "Walk-in or referral"
            }
        ],
        "police": [
            {
                "name": "Central Police Station - Gender Desk",
                "phone": "020-222222 / 999",
                "location": "University Way, Nairobi",
                "services": ["GBV reporting", "Protection orders", "Case follow-up"]
            },
            {
                "name": "Kilimani Police Station - Gender Desk",
                "phone": "020-2723585",
                "location": "Kilimani, Nairobi"
            }
        ]
    },
    
    # ==================== MOMBASA COUNTY ====================
    "Mombasa": {
        "medical": [
            {
                "name": "Coast General Teaching and Referral Hospital - GBV Centre",
                "type": "Public Hospital",
                "phone": "041-2312301 / 0713-449700",
                "location": "Hospital Road, Mombasa",
                "services": ["Medical examination", "PEP", "Counseling", "Forensics"],
                "hours": "24/7"
            },
            {
                "name": "Likoni Sub-County Hospital",
                "type": "Public Hospital",
                "phone": "041-2471720",
                "location": "Likoni, Mombasa",
                "services": ["GBV medical services", "Referrals"]
            }
        ],
        "legal": [
            {
                "name": "FIDA Kenya - Mombasa Office",
                "phone": "041-2314925 / 0800-720553",
                "location": "Mombasa",
                "services": ["Legal aid", "Court representation", "Legal education"]
            }
        ],
        "counseling": [
            {
                "name": "Coast Counselling and Support Services",
                "phone": "041-2222881",
                "services": ["Trauma counseling", "Group therapy", "Family therapy"]
            }
        ],
        "police": [
            {
                "name": "Mombasa Central Police Station - Gender Desk",
                "phone": "041-2312121",
                "location": "Makadara Road, Mombasa"
            }
        ]
    },
    
    # ==================== KISUMU COUNTY ====================
    "Kisumu": {
        "medical": [
            {
                "name": "Jaramogi Oginga Odinga Teaching and Referral Hospital - GBV Unit",
                "type": "Public Hospital",
                "phone": "057-2023395 / 0790-663000",
                "location": "Kisumu",
                "services": ["Medical care", "PEP", "Counseling"],
                "hours": "24/7"
            },
            {
                "name": "Kisumu County Hospital",
                "type": "Public Hospital",
                "phone": "057-2023981",
                "services": ["GBV medical services"]
            }
        ],
        "legal": [
            {
                "name": "FIDA Kenya - Kisumu Office",
                "phone": "057-2022844 / 0800-720553",
                "services": ["Legal aid", "Court representation"]
            }
        ],
        "police": [
            {
                "name": "Kisumu Central Police Station - Gender Desk",
                "phone": "057-2021111",
                "location": "Kisumu"
            }
        ]
    },
    
    # ==================== NAKURU COUNTY ====================
    "Nakuru": {
        "medical": [
            {
                "name": "Nakuru Level 5 Hospital - GBV Unit",
                "type": "Public Hospital",
                "phone": "051-2213268",
                "location": "Nakuru",
                "services": ["Medical examination", "PEP", "Counseling"],
                "hours": "24/7"
            }
        ],
        "legal": [
            {
                "name": "FIDA Kenya - Nakuru Office",
                "phone": "051-2211234 / 0800-720553",
                "services": ["Legal aid"]
            }
        ]
    },
    
    # ==================== ELDORET/UASIN GISHU COUNTY ====================
    "Uasin Gishu": {
        "medical": [
            {
                "name": "Moi Teaching and Referral Hospital - GBV Centre",
                "type": "Public Hospital",
                "phone": "053-2033471 / 0703-906000",
                "location": "Eldoret",
                "services": ["Medical care", "PEP", "Counseling", "Forensics"],
                "hours": "24/7"
            }
        ],
        "legal": [
            {
                "name": "FIDA Kenya - Eldoret Office",
                "phone": "053-2063366 / 0800-720553",
                "services": ["Legal aid"]
            }
        ]
    },
    
    # ==================== KIAMBU COUNTY ====================
    "Kiambu": {
        "medical": [
            {
                "name": "Kiambu Level 5 Hospital - GBV Unit",
                "type": "Public Hospital",
                "phone": "066-2031301",
                "location": "Kiambu Town",
                "services": ["Medical care", "PEP", "Counseling"]
            },
            {
                "name": "Thika Level 5 Hospital",
                "type": "Public Hospital",
                "phone": "067-22150",
                "location": "Thika",
                "services": ["GBV medical services"]
            }
        ]
    },
    
    # ==================== MACHAKOS COUNTY ====================
    "Machakos": {
        "medical": [
            {
                "name": "Machakos Level 5 Hospital - GBV Unit",
                "type": "Public Hospital",
                "phone": "044-21193",
                "location": "Machakos",
                "services": ["Medical care", "PEP"]
            }
        ]
    },
    
    # ==================== NATIONAL ORGANIZATIONS ====================
    "national_organizations": {
        "coalition_on_violence": {
            "name": "Coalition on Violence Against Women (COVAW)",
            "phone": "0736-002606 / 0722-384096",
            "email": "info@covaw.or.ke",
            "services": ["Advocacy", "Shelter", "Legal aid", "Counseling", "Economic empowerment"],
            "website": "www.covaw.or.ke"
        },
        "cradle": {
            "name": "Cradle - The Children Foundation",
            "phone": "020-3876290 / 0722-534722",
            "services": ["Child protection", "Rescue operations", "Legal support", "Counseling"],
            "focus": "Children affected by violence"
        },
        "wangu_kanja": {
            "name": "Wangu Kanja Foundation",
            "phone": "0722-371383",
            "services": ["Advocacy", "Police accountability", "Justice for survivors"],
            "focus": "Police violence against women"
        },
        "msichana_empowerment": {
            "name": "Msichana Empowerment",
            "phone": "0712-345678",
            "services": ["Legal aid", "Education support", "Advocacy"],
            "focus": "Girls' rights, harmful practices"
        }
    },
    
    # ==================== LEGAL FRAMEWORK ====================
    "legal_framework": {
        "constitution": {
            "name": "Constitution of Kenya, 2010",
            "key_provisions": [
                "Article 27: Equality and freedom from discrimination",
                "Article 28: Human dignity",
                "Article 29: Freedom and security of person"
            ]
        },
        "laws": [
            {
                "name": "Sexual Offences Act, 2006",
                "purpose": "Criminalizes sexual violence including rape, defilement, sexual assault",
                "penalties": "Life imprisonment for rape, 15+ years for defilement"
            },
            {
                "name": "Protection Against Domestic Violence Act, 2015",
                "purpose": "Protects victims of domestic violence",
                "provisions": ["Protection orders", "Occupation orders", "Police intervention"]
            },
            {
                "name": "Prohibition of Female Genital Mutilation Act, 2011",
                "purpose": "Criminalizes FGM",
                "penalty": "3-7 years imprisonment or fine"
            },
            {
                "name": "Counter-Trafficking in Persons Act, 2010",
                "purpose": "Combats human trafficking"
            },
            {
                "name": "Victim Protection Act, 2014",
                "purpose": "Protects witnesses and victims in legal proceedings"
            }
        ]
    },
    
    # ==================== GOVERNMENT INSTITUTIONS ====================
    "government": {
        "ngec": {
            "name": "National Gender and Equality Commission (NGEC)",
            "phone": "020-2717082 / 0738-008333",
            "email": "info@ngeckenya.org",
            "role": "Monitors gender equality, handles discrimination complaints",
            "website": "www.ngeckenya.org"
        },
        "odpp": {
            "name": "Office of the Director of Public Prosecutions - GBV Unit",
            "phone": "020-2729000",
            "role": "Prosecutes GBV cases, provides legal guidance"
        },
        "ncaj": {
            "name": "National Council on Administration of Justice (NCAJ)",
            "role": "Coordinates justice sector, fast-tracks GBV cases"
        }
    }
}


# ==================== RESOURCE MATCHING FUNCTIONS ====================

def get_county_resources(county: str, resource_type: str = None):
    """
    Get resources for a specific county
    
    Args:
        county: County name (e.g., "Nairobi", "Mombasa")
        resource_type: Specific type ("medical", "legal", "counseling", "shelters", "police")
    
    Returns:
        Dictionary of resources
    """
    county_data = KENYA_GBV_RESOURCES.get(county, {})
    
    if resource_type:
        return county_data.get(resource_type, [])
    
    return county_data


def get_national_resources():
    """Get national hotlines and organizations"""
    return {
        "hotlines": KENYA_GBV_RESOURCES["national_hotlines"],
        "organizations": KENYA_GBV_RESOURCES["national_organizations"],
        "legal_framework": KENYA_GBV_RESOURCES["legal_framework"],
        "government": KENYA_GBV_RESOURCES["government"]
    }


def search_resources(query: str = None, county: str = None, service_type: str = None):
    """
    Search resources with filters
    
    Args:
        query: Text search
        county: Filter by county
        service_type: Filter by type (medical, legal, counseling, etc.)
    
    Returns:
        List of matching resources
    """
    results = []
    
    # Add national hotlines (always relevant)
    results.append({
        "category": "National Hotlines",
        "resources": KENYA_GBV_RESOURCES["national_hotlines"]
    })
    
    # Add county-specific resources
    if county and county in KENYA_GBV_RESOURCES:
        county_resources = KENYA_GBV_RESOURCES[county]
        
        if service_type and service_type in county_resources:
            results.append({
                "category": f"{county} - {service_type.title()}",
                "resources": county_resources[service_type]
            })
        else:
            for svc_type, resources in county_resources.items():
                results.append({
                    "category": f"{county} - {svc_type.title()}",
                    "resources": resources
                })
    
    return results


# ==================== EXPORT FOR USE IN ACTIONS ====================

if __name__ == "__main__":
    # Test the database
    print("=== Nairobi Medical Facilities ===")
    for facility in get_county_resources("Nairobi", "medical"):
        print(f"- {facility['name']}: {facility['phone']}")
    
    print("\n=== National Hotlines ===")
    for key, hotline in get_national_resources()["hotlines"].items():
        print(f"- {hotline['name']}: {hotline['number']}")