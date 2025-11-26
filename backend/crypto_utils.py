import os
import base64
from cryptography.fernet import Fernet
import hashlib

# Get or generate encryption key
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    # Generate a key (in production, store this securely!)
    ENCRYPTION_KEY = Fernet.generate_key().decode()
    print(f"⚠️ Generated new encryption key. Add to .env:\nENCRYPTION_KEY={ENCRYPTION_KEY}")

# Initialize Fernet
cipher = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)

def encrypt_text(plaintext: str) -> str:
    """Encrypt text and return base64 string"""
    try:
        encrypted_bytes = cipher.encrypt(plaintext.encode())
        return base64.b64encode(encrypted_bytes).decode()
    except Exception as e:
        print(f"Encryption error: {e}")
        return base64.b64encode(plaintext.encode()).decode()  # Fallback to simple encoding

def decrypt_text(encrypted_text: str) -> str:
    """Decrypt base64 encrypted text"""
    try:
        encrypted_bytes = base64.b64decode(encrypted_text)
        decrypted = cipher.decrypt(encrypted_bytes).decode()
        return decrypted
    except Exception as e:
        print(f"Decryption error: {e}")
        try:
            return base64.b64decode(encrypted_text).decode()  # Try simple decoding
        except:
            return "[Decryption Failed]"

def generate_anonymous_id() -> str:
    """Generate random anonymous ID"""
    import uuid
    return str(uuid.uuid4())

class EncryptionManager:
    @staticmethod
    def hash_for_deduplication(text: str) -> str:
        """Create hash for deduplication without storing original"""
        return hashlib.sha256(text.encode()).hexdigest()

encryption_manager = EncryptionManager()