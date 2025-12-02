const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'tenant', 'TenantOnboarding.tsx');

// Read file
let content = fs.readFileSync(filePath, 'utf8');

// Fix emojis - using Unicode escape sequences
content = content.replace(/ðŸ"§/g, '\u{1F527}'); // Wrench
content = content.replace(/âŒ/g, '\u{274C}');    // Cross mark  
content = content.replace(/ðŸ'¡/g, '\u{1F4A1}'); // Light bulb

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Emoji encoding fixed!');
