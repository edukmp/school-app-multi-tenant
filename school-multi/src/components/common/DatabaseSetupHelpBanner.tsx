import React from 'react'
import { HelpCircle } from 'lucide-react'

const DatabaseSetupHelpBanner: React.FC = () => {
    return (
        <div style={{
            background: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '0.875rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        }}>
            <HelpCircle size={24} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <strong style={{ color: '#1e40af', fontSize: '0.9375rem', display: 'block' }}>
                    Need help setting up a local database?
                </strong>
                <p style={{ margin: '0.25rem 0 0 0', color: '#1e3a8a', fontSize: '0.875rem' }}>
                    Follow our step-by-step guide to install PostgreSQL on your computer.
                </p>
            </div>
            <a
                href="/help/database-setup"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#2563eb')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#3b82f6')}
            >
                View Guide →
            </a>
        </div>
    )
}

export default DatabaseSetupHelpBanner
