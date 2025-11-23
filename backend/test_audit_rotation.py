"""Test audit logging with rotation"""
import sys
sys.path.insert(0, 'app')

from utils.audit_logger import audit_logger

# Test logging
print("Testing audit logger with rotation...")
audit_logger.log_authentication("test_user", "192.168.1.1", True)
audit_logger.log_file_upload(None, "192.168.1.2", "test.pdf", "application/pdf", 12345)
audit_logger.log_rate_limit_exceeded("192.168.1.3", "/api/verify")

print("\n✅ Logs written successfully!")
print("\nChecking log file:")
import os
log_files = os.listdir("logs")
print(f"Log files: {log_files}")

print("\nLog content:")
with open("logs/audit.log", "r") as f:
    print(f.read())
