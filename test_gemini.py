import os
import sys
from pathlib import Path
import google.generativeai as genai

# Manual env loading
BACKEND_DIR = Path(__file__).resolve().parent
env_path = BACKEND_DIR.parent / '.env'
if env_path.exists():
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"API Key exists: {bool(GEMINI_API_KEY)}")

if not GEMINI_API_KEY:
    print("❌ ERROR: GEMINI_API_KEY not found")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)

# List available models first
print("\n📋 Checking available models...")
try:
    models = genai.list_models()
    available_models = []
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            available_models.append(model.name)
            print(f"✅ Available: {model.name}")
    
    print(f"\n🎯 Found {len(available_models)} available models")
    
    # Try the available models
    for model_name in available_models:
        try:
            print(f"\n🔄 Testing: {model_name}")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Say 'Hello from Vee AI' in one sentence.")
            print(f"✅ SUCCESS: {response.text}")
            break
        except Exception as e:
            print(f"❌ Failed: {str(e)[:100]}...")
            
except Exception as e:
    print(f"❌ Error listing models: {e}")