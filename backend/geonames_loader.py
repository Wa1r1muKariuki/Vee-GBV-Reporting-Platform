import csv
import json
import logging

logger = logging.getLogger(__name__)

def load_geonames_data(filepath='KE.txt'):
    """
    Load GeoNames Kenya data into a searchable dictionary.
    Returns a dict of location names to coordinates.
    """
    locations = {}
    
    logger.info(f"📂 Loading GeoNames data from {filepath}...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter='\t')
            
            for row in reader:
                if len(row) < 19:
                    continue
                
                try:
                    name = row[1].lower().strip()
                    alternate_names = row[3].lower() if len(row) > 3 else ""
                    lat = float(row[4])
                    lon = float(row[5])
                    feature_class = row[6]
                    feature_code = row[7]
                    admin1 = row[10]  # County/Region
                    population = int(row[14]) if row[14] else 0
                    
                    # Only include populated places (P) and administrative areas (A)
                    if feature_class in ['P', 'A']:
                        location_data = {
                            'lat': lat,
                            'lon': lon,
                            'county': admin1,
                            'population': population,
                            'type': feature_code
                        }
                        
                        # Add main name
                        locations[name] = location_data
                        
                        # Add alternate names
                        if alternate_names:
                            for alt_name in alternate_names.split(','):
                                alt_name = alt_name.strip()
                                if alt_name and len(alt_name) > 2:
                                    locations[alt_name] = location_data
                
                except (ValueError, IndexError) as e:
                    continue
        
        logger.info(f"✅ Loaded {len(locations)} locations from GeoNames")
        return locations
        
    except FileNotFoundError:
        logger.error(f"❌ {filepath} not found!")
        return {}
    except Exception as e:
        logger.error(f"❌ Error loading GeoNames: {e}")
        return {}

def save_to_json(locations, output_file='kenya_locations.json'):
    """Save locations to JSON for faster loading"""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(locations, f, indent=2)
    logger.info(f"✅ Saved {len(locations)} locations to {output_file}")

# Run this once to create the JSON file
if __name__ == "__main__":
    import sys
    import os
    
    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Load from KE.txt
    locations = load_geonames_data('../KE.txt')
    
    # Save to JSON
    if locations:
        save_to_json(locations, 'kenya_locations.json')
        
        # Test some searches
        print("\n🔍 Testing searches:")
        test_queries = ['westlands', 'nakuru', 'lanet', 'kisumu', 'mombasa', 'sarit']
        
        for query in test_queries:
            if query in locations:
                loc = locations[query]
                print(f"  ✅ {query.title()}: ({loc['lat']}, {loc['lon']}) - Pop: {loc['population']}")
            else:
                print(f"  ❌ {query.title()}: Not found")
    else:
        print("❌ Failed to load data")