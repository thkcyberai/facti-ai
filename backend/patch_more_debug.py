with open('app/services/jwt_service.py', 'r') as f:
    content = f.read()

# Add debug to type check
old = '''            # Check token type
            if payload.get("type") != token_type:
                return None'''

new = '''            # Check token type
            payload_type = payload.get("type")
            print(f"DEBUG: Type check - payload: '{payload_type}' vs expected: '{token_type}'")
            if payload_type != token_type:
                print(f"DEBUG: TYPE MISMATCH - returning None")
                return None
            print(f"DEBUG: Type check passed")'''

content = content.replace(old, new)

# Add debug to expiration check
old2 = '''            # Check expiration (jwt.decode already does this, but explicit check)
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
                return None
            
            return payload'''

new2 = '''            # Check expiration (jwt.decode already does this, but explicit check)
            exp = payload.get("exp")
            print(f"DEBUG: Expiration check - exp: {exp}")
            if exp:
                exp_time = datetime.fromtimestamp(exp)
                now = datetime.utcnow()
                print(f"DEBUG: exp_time: {exp_time}, now: {now}, expired: {exp_time < now}")
                if exp_time < now:
                    print(f"DEBUG: EXPIRED - returning None")
                    return None
            print(f"DEBUG: Expiration check passed")
            print(f"DEBUG: Returning payload: {payload}")
            return payload'''

content = content.replace(old, new)
content = content.replace(old2, new2)

with open('app/services/jwt_service.py', 'w') as f:
    f.write(content)
print("More debug added")
