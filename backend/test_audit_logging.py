"""Test Audit Logging"""
from app.utils.audit_logger import audit_logger

print("=" * 80)
print("TESTING AUDIT LOGGING")
print("=" * 80)

# Test various audit events
print("\n1. Logging authentication attempt...")
audit_logger.log_authentication("user123", "192.168.1.100", True)

print("2. Logging file upload...")
audit_logger.log_file_upload("user123", "192.168.1.100", "document.pdf", "application/pdf", 1024000)

print("3. Logging rate limit violation...")
audit_logger.log_rate_limit_exceeded("192.168.1.200", "/api/v1/kyc/verify")

print("4. Logging security alert...")
audit_logger.log_security_alert("sql_injection_attempt", "192.168.1.200", {"input": "SELECT * FROM users"})

print("\n✅ Events logged!")
print("\nChecking log file...")
import os
if os.path.exists("logs"):
    log_files = os.listdir("logs")
    print(f"Log files created: {log_files}")
    
    if log_files:
        with open(f"logs/{log_files[0]}", "r") as f:
            print("\nLog contents:")
            print(f.read())
else:
    print("No logs directory found")

print("\n" + "=" * 80)
