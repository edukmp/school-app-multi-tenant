# Fix emoji encoding in TenantOnboarding.tsx
import codecs

file_path = r"c:\Users\guest1\Documents\_PROZA\cursor\school-app-multi-tenant\school-multi\src\pages\tenant\TenantOnboarding.tsx"

# Read file with UTF-8 encoding
with codecs.open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace corrupted emojis with correct ones
replacements = {
    'ðŸ"§': '🔧',  # Wrench emoji
    'âŒ': '❌',    # Cross mark emoji
    'ðŸ'¡': '💡',  # Light bulb emoji
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Write back with UTF-8 encoding
with codecs.open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Emoji encoding fixed successfully!")
