"""Test Complete Input Validation"""
from app.middleware.input_validator import InputValidator
from fastapi import HTTPException

print("=" * 80)
print("TESTING COMPLETE INPUT VALIDATION")
print("=" * 80)

# Test 1: Email validation
print("\n1. Testing email validation...")
valid_emails = ["test@example.com", "user.name@domain.co.uk"]
invalid_emails = ["invalid", "@example.com", "test@"]

for email in valid_emails:
    try:
        InputValidator.validate_email(email)
        print(f"   OK Valid: {email}")
    except HTTPException:
        print(f"   FAIL: {email}")

for email in invalid_emails:
    try:
        InputValidator.validate_email(email)
        print(f"   FAIL Should have rejected: {email}")
    except HTTPException:
        print(f"   OK Rejected: {email}")

# Test 2: SQL Injection detection
print("\n2. Testing SQL injection detection...")
sql_attacks = ["SELECT * FROM users", "DROP TABLE users"]

for attack in sql_attacks:
    try:
        InputValidator.check_sql_injection(attack)
        print(f"   FAIL Missed: {attack}")
    except HTTPException:
        print(f"   OK Blocked: {attack}")

# Test 3: XSS detection
print("\n3. Testing XSS detection...")
xss_attacks = ["<script>alert(1)</script>", "javascript:alert(1)"]

for attack in xss_attacks:
    try:
        InputValidator.check_xss(attack)
        print(f"   FAIL Missed: {attack}")
    except HTTPException:
        print(f"   OK Blocked: {attack}")

print("\n" + "=" * 80)
print("INPUT VALIDATION TEST COMPLETE!")
print("=" * 80)
