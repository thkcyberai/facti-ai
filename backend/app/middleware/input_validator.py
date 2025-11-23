"""
Input Validation Middleware for KYCShield API - COMPLETE
Validates file uploads, request data, and prevents common attacks
"""

from fastapi import Request, HTTPException, UploadFile
from typing import List
import os
import re

class InputValidator:
    """Validates all incoming requests and file uploads"""

    # Allowed file extensions
    ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png']
    ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mpeg', '.mov']
    ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']

    # File size limits (in bytes)
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100MB
    MAX_DOCUMENT_SIZE = 20 * 1024 * 1024  # 20MB

    # Validation patterns
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    PHONE_PATTERN = re.compile(r'^\+?[1-9]\d{1,14}$')
    SQL_INJECTION_PATTERN = re.compile(r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|WHERE|FROM)\b)", re.IGNORECASE)
    XSS_PATTERN = re.compile(r'<script|javascript:|onerror=|onload=', re.IGNORECASE)

    @staticmethod
    def validate_file_size(file: UploadFile, max_size: int) -> bool:
        """Validate file size"""
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)

        if file_size > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {max_size / (1024*1024):.1f}MB"
            )

        if file_size == 0:
            raise HTTPException(status_code=400, detail="File is empty")

        return True

    @staticmethod
    def validate_file_extension(filename: str, allowed_extensions: List[str]) -> bool:
        """Validate file extension"""
        ext = os.path.splitext(filename.lower())[1]

        if ext not in allowed_extensions:
            raise HTTPException(
                status_code=415,
                detail=f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
            )

        return True

    @staticmethod
    def validate_filename(filename: str) -> bool:
        """Validate filename to prevent path traversal"""
        if not filename:
            raise HTTPException(status_code=400, detail="Filename is required")

        if '..' in filename or '/' in filename or '\\' in filename:
            raise HTTPException(status_code=400, detail="Invalid filename: path traversal detected")

        if len(filename) > 255:
            raise HTTPException(status_code=400, detail="Filename too long (max 255 characters)")

        if '\x00' in filename:
            raise HTTPException(status_code=400, detail="Invalid filename: null byte detected")

        return True

    @staticmethod
    def validate_image_upload(file: UploadFile) -> bool:
        """Validate image upload"""
        InputValidator.validate_filename(file.filename)
        InputValidator.validate_file_extension(file.filename, InputValidator.ALLOWED_IMAGE_EXTENSIONS)
        InputValidator.validate_file_size(file, InputValidator.MAX_IMAGE_SIZE)
        return True

    @staticmethod
    def validate_video_upload(file: UploadFile) -> bool:
        """Validate video upload"""
        InputValidator.validate_filename(file.filename)
        InputValidator.validate_file_extension(file.filename, InputValidator.ALLOWED_VIDEO_EXTENSIONS)
        InputValidator.validate_file_size(file, InputValidator.MAX_VIDEO_SIZE)
        return True

    @staticmethod
    def validate_document_upload(file: UploadFile) -> bool:
        """Validate document upload"""
        InputValidator.validate_filename(file.filename)
        InputValidator.validate_file_extension(file.filename, InputValidator.ALLOWED_DOCUMENT_EXTENSIONS)
        InputValidator.validate_file_size(file, InputValidator.MAX_DOCUMENT_SIZE)
        return True

    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        if not email or not InputValidator.EMAIL_PATTERN.match(email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        return True

    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone number (E.164 format)"""
        if not phone or not InputValidator.PHONE_PATTERN.match(phone):
            raise HTTPException(status_code=400, detail="Invalid phone number format (use E.164: +1234567890)")
        return True

    @staticmethod
    def sanitize_string(input_str: str, max_length: int = 1000) -> str:
        """Sanitize string input"""
        if not input_str:
            return ""

        sanitized = input_str.replace('\x00', '')
        sanitized = sanitized[:max_length]
        sanitized = ''.join(char for char in sanitized if char == '\n' or char == '\t' or ord(char) >= 32)

        return sanitized.strip()

    @staticmethod
    def check_sql_injection(input_str: str) -> None:
        """Check for SQL injection patterns"""
        if InputValidator.SQL_INJECTION_PATTERN.search(input_str):
            raise HTTPException(status_code=400, detail="Input contains suspicious SQL patterns")

    @staticmethod
    def check_xss(input_str: str) -> None:
        """Check for XSS patterns"""
        if InputValidator.XSS_PATTERN.search(input_str):
            raise HTTPException(status_code=400, detail="Input contains suspicious script patterns")

    @staticmethod
    def validate_string_input(input_str: str, max_length: int = 1000, 
                            check_sql: bool = True, check_xss_attack: bool = True) -> str:
        """Complete string validation"""
        if check_sql:
            InputValidator.check_sql_injection(input_str)
        if check_xss_attack:
            InputValidator.check_xss(input_str)
        return InputValidator.sanitize_string(input_str, max_length)


async def input_validation_middleware(request: Request, call_next):
    """Middleware to add input validation info to request"""
    request.state.validator = InputValidator()
    response = await call_next(request)
    return response
