import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import base64
import secrets


class EncryptionManager:
    """Manages encryption/decryption with key rotation support"""
    
    def __init__(self, key_file="secret.key"):
        self.key_file = key_file
        self.key = self._load_or_generate_key()
        self.cipher = Fernet(self.key)
    
    def _load_or_generate_key(self) -> bytes:
        """Load existing key or generate new one"""
        if os.path.exists(self.key_file):
            with open(self.key_file, 'rb') as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(self.key_file, 'wb') as f:
                f.write(key)
            os.chmod(self.key_file, 0o600)  # Read/write for owner only
            return key
    
    def encrypt_text(self, plaintext: str) -> str:
        """Encrypt text and return base64 string"""
        if not plaintext:
            return None
        encrypted = self.cipher.encrypt(plaintext.encode('utf-8'))
        return base64.b64encode(encrypted).decode('utf-8')
    
    def decrypt_text(self, encrypted_text: str) -> str:
        """Decrypt base64 encoded text"""
        if not encrypted_text:
            return None
        try:
            encrypted = base64.b64decode(encrypted_text.encode('utf-8'))
            decrypted = self.cipher.decrypt(encrypted)
            return decrypted.decode('utf-8')
        except Exception as e:
            raise ValueError(f"Decryption failed: {e}")
    
    def generate_anonymous_id(self) -> str:
        """Generate cryptographically secure anonymous ID"""
        return f"anon_{secrets.token_hex(16)}"
    
    def hash_for_deduplication(self, text: str) -> str:
        """One-way hash for detecting duplicates without storing original"""
        from hashlib import sha256
        return sha256(text.encode('utf-8')).hexdigest()


# Singleton instance
encryption_manager = EncryptionManager()

# Convenience functions
def encrypt_text(text: str) -> str:
    return encryption_manager.encrypt_text(text)

def decrypt_text(encrypted: str) -> str:
    return encryption_manager.decrypt_text(encrypted)

def generate_anonymous_id() -> str:
    return encryption_manager.generate_anonymous_id()