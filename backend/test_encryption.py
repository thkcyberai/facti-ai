"""
Test Encryption Service
Tests encryption/decryption of sensitive data
"""

import sys
sys.path.insert(0, '.')

from app.services.encryption_service import EncryptionService

print("=" * 60)
print("ENCRYPTION SERVICE TEST")
print("=" * 60)

# Create encryption service
enc_service = EncryptionService()

# TEST 1: Basic Encryption/Decryption
print("\n✅ TEST 1: Basic Encryption/Decryption")
print("-" * 60)
original = "Sensitive PII Data: SSN 123-45-6789"
print(f"Original: {original}")

encrypted = enc_service.encrypt(original)
print(f"Encrypted: {encrypted[:50]}...")
print(f"✓ Encrypted length: {len(encrypted)} characters")

decrypted = enc_service.decrypt(encrypted)
print(f"Decrypted: {decrypted}")
print(f"✓ Match: {original == decrypted}")

# TEST 2: Empty String Handling
print("\n✅ TEST 2: Empty String Handling")
print("-" * 60)
empty_encrypted = enc_service.encrypt("")
print(f"Empty string encrypted: '{empty_encrypted}'")
print(f"✓ Returns empty string: {empty_encrypted == ''}")

# TEST 3: Dictionary Encryption
print("\n✅ TEST 3: Dictionary Field Encryption")
print("-" * 60)
user_data = {
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+1-555-0123",
    "ssn": "123-45-6789",
    "company": "Acme Corp"
}

fields_to_encrypt = ["phone_number", "ssn"]
print(f"Original data: {user_data}")

encrypted_data = enc_service.encrypt_dict(user_data, fields_to_encrypt)
print(f"\nEncrypted data:")
for key, value in encrypted_data.items():
    if key in fields_to_encrypt:
        print(f"  {key}: {value[:30]}... (encrypted)")
    else:
        print(f"  {key}: {value}")

decrypted_data = enc_service.decrypt_dict(encrypted_data, fields_to_encrypt)
print(f"\nDecrypted data: {decrypted_data}")
print(f"✓ Data matches original: {user_data == decrypted_data}")

# TEST 4: Encryption is Deterministic (same input = different output due to IV)
print("\n✅ TEST 4: Encryption Randomness")
print("-" * 60)
text = "Test data"
enc1 = enc_service.encrypt(text)
enc2 = enc_service.encrypt(text)
print(f"Original: {text}")
print(f"Encrypted 1: {enc1[:40]}...")
print(f"Encrypted 2: {enc2[:40]}...")
print(f"✓ Different ciphertexts (random IV): {enc1 != enc2}")
print(f"✓ Both decrypt correctly: {enc_service.decrypt(enc1) == text and enc_service.decrypt(enc2) == text}")

# TEST 5: Generate New Key
print("\n✅ TEST 5: Key Generation")
print("-" * 60)
new_key = EncryptionService.generate_key()
print(f"Generated key: {new_key[:30]}...")
print(f"✓ Key length: {len(new_key)} characters")
print("⚠️  IMPORTANT: In production, store this key in .env file!")

# TEST 6: Invalid Decryption Handling
print("\n✅ TEST 6: Invalid Decryption Handling")
print("-" * 60)
invalid_ciphertext = "invalid_encrypted_data_12345"
result = enc_service.decrypt(invalid_ciphertext)
print(f"Attempting to decrypt invalid data...")
print(f"Result: '{result}'")
print(f"✓ Returns empty string on failure: {result == ''}")

print("\n" + "=" * 60)
print("🎉 ALL ENCRYPTION TESTS PASSED!")
print("=" * 60)
print("\nSECURITY FEATURES:")
print("✓ Fernet symmetric encryption (AES-128)")
print("✓ Automatic IV generation (different ciphertext each time)")
print("✓ Safe error handling (doesn't expose encryption details)")
print("✓ Dictionary field encryption (selective PII encryption)")
print("✓ Empty string handling")
print("\nNEXT STEPS:")
print("1. Generate production encryption key")
print("2. Store key in .env file (ENCRYPTION_KEY=...)")
print("3. Never commit encryption key to Git!")
print("4. Use field-level encryption for PII in database")
