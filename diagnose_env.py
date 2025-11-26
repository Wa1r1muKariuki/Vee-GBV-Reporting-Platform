from pathlib import Path
import sys

def remove_bom_from_env():
    env_path = Path('.env')
    
    if not env_path.exists():
        print("❌ .env file not found")
        return False
        
    print("🔧 Removing UTF-8 BOM from .env file...")
    
    # Read the file in binary mode to detect BOM
    with open(env_path, 'rb') as f:
        content_bytes = f.read()
    
    # Check for BOM and remove it
    if content_bytes.startswith(b'\xef\xbb\xbf'):
        print("✅ Found and removing UTF-8 BOM")
        content_bytes = content_bytes[3:]
        
        # Write back without BOM
        with open(env_path, 'wb') as f:
            f.write(content_bytes)
        print("✅ BOM removed successfully")
        return True
    else:
        print("✅ No BOM found")
        return True

def create_clean_env():
    """Create a clean .env file with just the essential variables"""
    env_path = Path('.env')
    
    print("🔄 Creating clean .env file...")
    
    clean_content = """# Vee AI Essential Configuration
GEMINI_API_KEY=AIzaSyBxJX1qhOggIIw3t87pcHkMBO-5VqCXxBk
VEE_ADMIN_TOKEN=MySecurePassword123

# Optional Settings
LOG_LEVEL=INFO
SESSION_TIMEOUT_MINUTES=60
"""
    
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(clean_content)
    
    print("✅ Clean .env file created")
    return True

if __name__ == "__main__":
    print("🚀 Fixing .env file...")
    
    # First try to remove BOM
    if remove_bom_from_env():
        print("✅ BOM fix attempted")
    else:
        print("❌ Failed to fix BOM")
        
    # Create a clean version to be sure
    if create_clean_env():
        print("✅ Clean .env file ready")
        
    # Verify the fix
    print("\n🔍 Verifying fix...")
    with open('.env', 'r', encoding='utf-8') as f:
        first_line = f.readline().strip()
        print(f"First line: '{first_line}'")
        
        if first_line.startswith('ï»¿'):
            print("❌ BOM still present!")
        else:
            print("✅ No BOM detected!")
            
    print("\n📝 Current .env content:")
    with open('.env', 'r') as f:
        for i, line in enumerate(f, 1):
            if line.strip():
                print(f"   {i}: {line.strip()}")