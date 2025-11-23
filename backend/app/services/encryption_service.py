"""
Encryption Service for KYCShield
Handles encryption/decryption of sensitive data (PII, documents)
Uses Fernet symmetric encryption (AES-128)
"""

from cryptography.fernet import Fernet
from typing import Optional
import base64
import os

# CRITICAL: In production, load from environment variable
# For now, generate a key (this should be in .env file)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())

class EncryptionService:
    """Service for encrypting/decrypting sensitive data"""
    
    def __init__(self):
        """Initialize Fernet cipher"""
        # Convert key to bytes if string
        key_bytes = ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY
        self.cipher = Fernet(key_bytes)
    
    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt plaintext string
        Returns: Base64 encoded encrypted string
        """
        if not plaintext:
            return ""
        
        # Convert to bytes, encrypt, return as string
        plaintext_bytes = plaintext.encode('utf-8')
        encrypted_bytes = self.cipher.encrypt(plaintext_bytes)
        return encrypted_bytes.decode('utf-8')
    
    def decrypt(self, ciphertext: str) -> str:
        """
        Decrypt encrypted string
        Returns: Original plaintext string
        """
        if not ciphertext:
            return ""
        
        try:
            # Convert to bytes, decrypt, return as string
            ciphertext_bytes = ciphertext.encode('utf-8')
            decrypted_bytes = self.cipher.decrypt(ciphertext_bytes)
            return decrypted_bytes.decode('utf-8')
        except Exception as e:
            # Log decryption failure but don't expose details
            print(f"Decryption failed: {type(e).__name__}")
            return ""
    
    def encrypt_dict(self, data: dict, fields_to_encrypt: list) -> dict:
        """
        Encrypt specific fields in a dictionary
        
        Args:
            data: Dictionary with sensitive fields
            fields_to_encrypt: List of field names to encrypt
        
        Returns:
            Dictionary with encrypted fields
        """
        encrypted_data = data.copy()
        
        for field in fields_to_encrypt:
            if field in encrypted_data and encrypted_data[field]:
                encrypted_data[field] = self.encrypt(str(encrypted_data[field]))
        
        return encrypted_data
    
    def decrypt_dict(self, data: dict, fields_to_decrypt: list) -> dict:
        """
        Decrypt specific fields in a dictionary
        
        Args:
            data: Dictionary with encrypted fields
            fields_to_decrypt: List of field names to decrypt
        
        Returns:
            Dictionary with decrypted fields
        """
        decrypted_data = data.copy()
        
        for field in fields_to_decrypt:
            if field in decrypted_data and decrypted_data[field]:
                decrypted_data[field] = self.decrypt(decrypted_data[field])
        
        return decrypted_data
    
    @staticmethod
    def generate_key() -> str:
        """
        Generate a new encryption key
        IMPORTANT: Save this key securely! Data encrypted with one key
        cannot be decrypted with a different key.
        """
        return Fernet.generate_key().decode('utf-8')


# Global encryption service instance
encryption_service = EncryptionService()


# Example: Fields that should be encrypted in database
SENSITIVE_FIELDS = [
    "phone_number",
    "address",
    "ssn",
    "passport_number",
    "drivers_license",
    "document_data"
]
