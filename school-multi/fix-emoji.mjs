import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'pages', 'tenant', 'TenantOnboarding.tsx');

// Read file
let content = fs.readFileSync(filePath, 'utf8');

// Fix emojis - using actual Unicode characters
content = content.replace(/ðŸ"§/g, '🔧'); // Wrench
content = content.replace(/âŒ/g, '❌');    // Cross mark  
content = content.replace(/ðŸ'¡/g, '💡'); // Light bulb

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Emoji encoding fixed!');
