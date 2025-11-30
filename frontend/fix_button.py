# Read the file
with open('C:/python/facti-ai/frontend/src/pages/HomePage.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Make replacements
content = content.replace("background: 'transparent',", "background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',")
content = content.replace("border: '1px solid rgba(96, 165, 250, 0.5)',", "border: 'none',")
content = content.replace("color: '#60a5fa',", "color: 'white',", 1)
content = content.replace("Try Now <span>", "Try Demo <span>")

# Write the file
with open('C:/python/facti-ai/frontend/src/pages/HomePage.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! Changes applied.")
