# Add debug print to verify_token method
with open('app/services/jwt_service.py', 'r') as f:
    content = f.read()

# Add debug after the try:
old = '''        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])'''

new = '''        try:
            print(f"DEBUG: Decoding token...")
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            print(f"DEBUG: Decoded successfully: {payload}")'''

content = content.replace(old, new)

# Add debug to exception
old2 = '''        except JWTError:
            return None'''

new2 = '''        except JWTError as e:
            print(f"DEBUG: JWTError caught: {e}")
            return None
        except Exception as e:
            print(f"DEBUG: Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            return None'''

content = content.replace(old2, new2)

with open('app/services/jwt_service.py', 'w') as f:
    f.write(content)
print("Debug added to jwt_service.py")
