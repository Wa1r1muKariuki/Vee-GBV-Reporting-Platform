# load_counties.py
"""
Loads county resources from JSON file
Makes it easy to maintain and update resources without touching code
"""

import json
import os
from typing import Dict, List, Optional

# Path to the JSON file
COUNTIES_JSON_PATH = os.path.join(os.path.dirname(__file__), 'counties_resources.json')


def load_counties_data() -> Dict:
    """Load all counties data from JSON file"""
    try:
        with open(COUNTIES_JSON_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: {COUNTIES_JSON_PATH} not found. Using default data.")
        return {"counties": {}, "metadata": {}}
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return {"counties": {}, "metadata": {}}


def get_county_resources(county_name: str, resource_type: Optional[str] = None) -> Dict:
    """
    Get resources for a specific county
    
    Args:
        county_name: Name of the county (e.g., "Nairobi", "Mombasa")
        resource_type: Optional filter ("medical", "legal", "counseling", "shelters", "police")
    
    Returns:
        Dictionary of resources for the county
    """
    data = load_counties_data()
    counties = data.get("counties", {})
    
    if county_name not in counties:
        return {}
    
    county_data = counties[county_name]
    
    if resource_type and resource_type in county_data:
        return {resource_type: county_data[resource_type]}
    
    return county_data


def get_all_counties() -> List[str]:
    """Get list of all available counties"""
    data = load_counties_data()
    return list(data.get("counties", {}).keys())


def get_verified_counties() -> List[str]:
    """Get list of counties with verified resources"""
    data = load_counties_data()
    counties = data.get("counties", {})
    return [name for name, info in counties.items() if info.get("verified", False)]


def search_resources(
    query: Optional[str] = None,
    county: Optional[str] = None,
    service_type: Optional[str] = None,
    region: Optional[str] = None
) -> List[Dict]:
    """
    Search resources with multiple filters
    
    Args:
        query: Text search in resource names
        county: Filter by specific county
        service_type: Filter by service type
        region: Filter by region (Coast, Eastern, Central, etc.)
    
    Returns:
        List of matching resources with their locations
    """
    data = load_counties_data()
    counties = data.get("counties", {})
    results = []
    
    for county_name, county_data in counties.items():
        # Apply filters
        if county and county_name.lower() != county.lower():
            continue
        
        if region and county_data.get("region", "").lower() != region.lower():
            continue
        
        # Get service types to search
        service_types = [service_type] if service_type else ["medical", "legal", "counseling", "shelters", "police"]
        
        for svc_type in service_types:
            resources = county_data.get(svc_type, [])
            
            for resource in resources:
                # Apply text search if query provided
                if query:
                    query_lower = query.lower()
                    if not any([
                        query_lower in resource.get("name", "").lower(),
                        query_lower in resource.get("phone", ""),
                        query_lower in resource.get("location", "").lower(),
                        any(query_lower in service.lower() for service in resource.get("services", []))
                    ]):
                        continue
                
                # Add county context to result
                result = {
                    **resource,
                    "county": county_name,
                    "service_category": svc_type,
                    "region": county_data.get("region", "Unknown"),
                    "verified": county_data.get("verified", False)
                }
                results.append(result)
    
    return results


def get_regions() -> List[str]:
    """Get list of all regions in Kenya"""
    data = load_counties_data()
    counties = data.get("counties", {})
    regions = set(county.get("region", "") for county in counties.values())
    return sorted([r for r in regions if r])


def get_counties_by_region(region: str) -> List[str]:
    """Get all counties in a specific region"""
    data = load_counties_data()
    counties = data.get("counties", {})
    return [
        name for name, info in counties.items() 
        if info.get("region", "").lower() == region.lower()
    ]


def get_coverage_statistics() -> Dict:
    """Get statistics about resource coverage"""
    data = load_counties_data()
    counties = data.get("counties", {})
    
    stats = {
        "total_counties": len(counties),
        "verified_counties": 0,
        "counties_with_medical": 0,
        "counties_with_legal": 0,
        "counties_with_counseling": 0,
        "counties_with_shelters": 0,
        "counties_with_police": 0,
        "total_resources": 0,
        "by_region": {}
    }
    
    for county_name, county_data in counties.items():
        if county_data.get("verified"):
            stats["verified_counties"] += 1
        
        if county_data.get("medical"):
            stats["counties_with_medical"] += 1
        if county_data.get("legal"):
            stats["counties_with_legal"] += 1
        if county_data.get("counseling"):
            stats["counties_with_counseling"] += 1
        if county_data.get("shelters"):
            stats["counties_with_shelters"] += 1
        if county_data.get("police"):
            stats["counties_with_police"] += 1
        
        # Count total resources
        for key in ["medical", "legal", "counseling", "shelters", "police"]:
            stats["total_resources"] += len(county_data.get(key, []))
        
        # By region
        region = county_data.get("region", "Unknown")
        if region not in stats["by_region"]:
            stats["by_region"][region] = 0
        stats["by_region"][region] += 1
    
    return stats


def validate_json_file() -> List[str]:
    """
    Validate the JSON file for common issues
    Returns list of warnings/errors
    """
    issues = []
    
    try:
        data = load_counties_data()
    except Exception as e:
        return [f"Failed to load JSON: {e}"]
    
    counties = data.get("counties", {})
    
    if not counties:
        issues.append("No counties found in JSON file")
        return issues
    
    for county_name, county_data in counties.items():
        # Check for required fields
        if "region" not in county_data:
            issues.append(f"{county_name}: Missing 'region' field")
        
        # Check for phone numbers that need verification
        for service_type in ["medical", "legal", "counseling", "shelters", "police"]:
            resources = county_data.get(service_type, [])
            for resource in resources:
                phone = resource.get("phone", "")
                if "TO BE VERIFIED" in phone:
                    issues.append(f"{county_name} - {resource.get('name', 'Unknown')}: Phone needs verification")
                
                if not resource.get("name"):
                    issues.append(f"{county_name} - {service_type}: Resource missing name")
    
    return issues


# ==================== MAIN USAGE EXAMPLE ====================

if __name__ == "__main__":
    print("=" * 60)
    print("KENYA GBV RESOURCES - DATA LOADER")
    print("=" * 60)
    
    # Statistics
    print("\n📊 Coverage Statistics:")
    stats = get_coverage_statistics()
    print(f"  Total Counties: {stats['total_counties']}")
    print(f"  Verified Counties: {stats['verified_counties']}")
    print(f"  Total Resources: {stats['total_resources']}")
    print(f"  Counties with Medical: {stats['counties_with_medical']}")
    print(f"  Counties with Legal: {stats['counties_with_legal']}")
    
    print("\n🗺️  By Region:")
    for region, count in stats['by_region'].items():
        print(f"  {region}: {count} counties")
    
    # Validation
    print("\n🔍 Validation Issues:")
    issues = validate_json_file()
    if issues:
        for issue in issues[:10]:  # Show first 10
            print(f"  ⚠️  {issue}")
        if len(issues) > 10:
            print(f"  ... and {len(issues) - 10} more issues")
    else:
        print("  ✅ No issues found")
    
    # Example searches
    print("\n🔎 Example: Medical facilities in Nairobi")
    nairobi_medical = get_county_resources("Nairobi", "medical")
    for facility in nairobi_medical.get("medical", [])[:3]:
        print(f"  - {facility['name']}: {facility['phone']}")
    
    print("\n🔎 Example: All FIDA Kenya offices")
    fida_offices = search_resources(query="FIDA Kenya")
    print(f"  Found {len(fida_offices)} FIDA offices")
    for office in fida_offices[:5]:
        print(f"  - {office['county']}: {office['phone']}")
    
    print("\n" + "=" * 60)