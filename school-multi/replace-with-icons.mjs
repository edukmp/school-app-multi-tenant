import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'pages', 'tenant', 'TenantOnboarding.tsx');

// Read file
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Tool and XCircle to imports
content = content.replace(
    /from 'lucide-react'/,
    "from 'lucide-react'\nimport { Tool, XCircle, Lightbulb } from 'lucide-react'"
);

// Actually, let's just add them to the existing import
content = content.replace(
    /Database, Server, Palette, HelpCircle, CheckCircle, Layout, ArrowRight, ArrowLeft, Loader, LogOut/,
    'Database, Server, Palette, HelpCircle, CheckCircle, Layout, ArrowRight, ArrowLeft, Loader, LogOut, Tool, XCircle, Lightbulb'
);

// 2. Replace emoji with icon in error display (line ~419)
content = content.replace(
    /{connectionTest\.status === 'error' && <span style=\{\{ fontSize: '1\.25rem' \}\}>.*?<\/span>}/,
    "{connectionTest.status === 'error' && <XCircle size={20} />}"
);

// 3. Replace emoji in troubleshooting header (line ~466)
content = content.replace(
    /ðŸ"§ Troubleshooting Steps:/,
    '<><Tool size={18} style={{ marginRight: "0.5rem" }} />Troubleshooting Steps:</>'
);

// Alternative if the above doesn't work - replace the whole div
content = content.replace(
    /<div style=\{\{[^}]+fontWeight: 600,[^}]+color: '#9a3412',[^}]+\}\}>\s*ðŸ"§ Troubleshooting Steps:\s*<\/div>/s,
    `<div style={{
                                        fontWeight: 600,
                                        color: '#9a3412',
                                        marginBottom: '0.75rem',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Tool size={18} />
                                        Troubleshooting Steps:
                                    </div>`
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Icons replaced successfully!');
