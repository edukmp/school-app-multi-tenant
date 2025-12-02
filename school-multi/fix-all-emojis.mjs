import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
    'src/pages/tenant/TenantOnboarding.tsx',
    'src/pages/tenant/DatabaseSetupGuide.tsx',
    'src/components/common/DatabaseSetupHelpBanner.tsx'
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping ${file} (not found)`);
        return;
    }

    // Read file
    let content = fs.readFileSync(filePath, 'utf8');

    // Count replacements
    let count = 0;

    // Fix corrupted emojis
    const before = content;
    content = content.replace(/ðŸ"§/g, () => { count++; return '🔧'; }); // Wrench
    content = content.replace(/âŒ/g, () => { count++; return '❌'; });    // Cross mark  
    content = content.replace(/ðŸ'¡/g, () => { count++; return '💡'; }); // Light bulb

    if (before !== content) {
        // Write back
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${count} emoji(s) in ${file}`);
    } else {
        console.log(`✓  No issues in ${file}`);
    }
});

console.log('\n🎉 All files processed!');
