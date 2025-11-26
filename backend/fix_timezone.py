with open('app/services/jwt_service.py', 'r') as f:
    content = f.read()

# Fix the timezone issue
old = 'if exp and datetime.fromtimestamp(exp) < datetime.utcnow():'
new = 'if exp and datetime.utcfromtimestamp(exp) < datetime.utcnow():'

content = content.replace(old, new)

with open('app/services/jwt_service.py', 'w') as f:
    f.write(content)
print("Timezone fix applied")
