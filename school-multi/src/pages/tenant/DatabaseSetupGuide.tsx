import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Database, Download, Terminal, CheckCircle, AlertCircle, ExternalLink, Lightbulb, XCircle } from 'lucide-react'
import '../../styles/setup-guide.scss'

const DatabaseSetupGuide: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="setup-guide-container">
            <div className="setup-guide-content">
                {/* Header */}
                <div className="guide-header">
                    <button onClick={() => navigate(-1)} className="back-button">
                        <ArrowLeft size={20} />
                        Back to Setup
                    </button>
                    <h1>
                        <Database size={32} />
                        Database Setup Guide
                    </h1>
                    <p className="subtitle">Step-by-step guide to set up PostgreSQL database on your local computer</p>
                </div>

                {/* Main Content */}
                <div className="guide-body">
                    {/* Prerequisites */}
                    <section className="guide-section">
                        <div className="section-header">
                            <AlertCircle size={24} />
                            <h2>Before You Start</h2>
                        </div>
                        <div className="info-box info">
                            <p><strong>What you'll need:</strong></p>
                            <ul>
                                <li>Windows computer with administrator access</li>
                                <li>At least 200MB free disk space</li>
                                <li>Internet connection to download PostgreSQL</li>
                                <li>15-20 minutes of your time</li>
                            </ul>
                        </div>
                    </section>

                    {/* Step 1: Download PostgreSQL */}
                    <section className="guide-section">
                        <div className="section-header step-number">
                            <div className="step-badge">1</div>
                            <h2>Download PostgreSQL</h2>
                        </div>

                        <div className="step-content">
                            <p>PostgreSQL is a free, open-source database system. We'll use the official Windows installer.</p>

                            <div className="action-box">
                                <Download size={20} />
                                <div>
                                    <strong>Download PostgreSQL for Windows</strong>
                                    <p>Click the button below to download the latest version (recommended: PostgreSQL 15 or 16)</p>
                                </div>
                                <a
                                    href="https://www.postgresql.org/download/windows/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="download-button"
                                >
                                    Download Now <ExternalLink size={16} />
                                </a>
                            </div>

                            <div className="info-box tip">
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Lightbulb size={18} /> Tip:
                                </strong> Choose the "Windows x86-64" installer from EnterpriseDB. The file will be around 200-300MB.
                            </div>
                        </div>
                    </section>

                    {/* Step 2: Install PostgreSQL */}
                    <section className="guide-section">
                        <div className="section-header step-number">
                            <div className="step-badge">2</div>
                            <h2>Install PostgreSQL</h2>
                        </div>

                        <div className="step-content">
                            <ol className="installation-steps">
                                <li>
                                    <strong>Run the installer</strong>
                                    <p>Double-click the downloaded file (e.g., <code>postgresql-16.x-windows-x64.exe</code>)</p>
                                </li>
                                <li>
                                    <strong>Click "Next" through the welcome screens</strong>
                                    <p>Accept the default installation directory (usually <code>C:\Program Files\PostgreSQL\16</code>)</p>
                                </li>
                                <li>
                                    <strong>Select components</strong>
                                    <p>Keep all components checked (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)</p>
                                </li>
                                <li>
                                    <strong>Choose data directory</strong>
                                    <p>Accept the default: <code>C:\Program Files\PostgreSQL\16\data</code></p>
                                </li>
                                <li>
                                    <strong>Set password for "postgres" user</strong>
                                    <div className="warning-box">
                                        <AlertCircle size={18} />
                                        <div>
                                            <strong>IMPORTANT: Remember this password!</strong>
                                            <p>You'll need this password to connect to your database. Write it down or save it in a password manager.</p>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <strong>Port number</strong>
                                    <p>Keep the default port: <code>5432</code></p>
                                </li>
                                <li>
                                    <strong>Locale</strong>
                                    <p>Select "Default locale" or your preferred language</p>
                                </li>
                                <li>
                                    <strong>Complete installation</strong>
                                    <p>Click "Next" and then "Finish". Uncheck "Launch Stack Builder" at the end.</p>
                                </li>
                            </ol>
                        </div>
                    </section>

                    {/* Step 3: Verify Installation */}
                    <section className="guide-section">
                        <div className="section-header step-number">
                            <div className="step-badge">3</div>
                            <h2>Verify PostgreSQL is Running</h2>
                        </div>

                        <div className="step-content">
                            <p>Let's make sure PostgreSQL installed correctly and is running.</p>

                            <div className="substeps">
                                <div className="substep">
                                    <strong>Option A: Check Windows Services</strong>
                                    <ol>
                                        <li>Press <kbd>Win + R</kbd> to open Run dialog</li>
                                        <li>Type <code>services.msc</code> and press Enter</li>
                                        <li>Look for <strong>"postgresql-x64-16"</strong> (or similar)</li>
                                        <li>Status should be <span className="status-running">Running</span></li>
                                    </ol>
                                </div>

                                <div className="substep">
                                    <strong>Option B: Use Command Prompt</strong>
                                    <ol>
                                        <li>Press <kbd>Win + R</kbd>, type <code>cmd</code>, press Enter</li>
                                        <li>Type this command and press Enter:</li>
                                    </ol>
                                    <div className="code-block">
                                        <Terminal size={16} />
                                        <code>psql -U postgres -c "SELECT version();"</code>
                                    </div>
                                    <p>If prompted for password, enter the password you set during installation.</p>
                                    <div className="info-box success">
                                        <CheckCircle size={18} />
                                        <strong>Success!</strong> If you see PostgreSQL version information, it's working correctly.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Step 4: Create Database */}
                    <section className="guide-section">
                        <div className="section-header step-number">
                            <div className="step-badge">4</div>
                            <h2>Create Your School Database</h2>
                        </div>

                        <div className="step-content">
                            <p>Now we'll create a database specifically for your school management system.</p>

                            <div className="substeps">
                                <div className="substep">
                                    <strong>Method 1: Using pgAdmin (Graphical Interface - Easier)</strong>
                                    <ol>
                                        <li>Open <strong>pgAdmin 4</strong> from Start Menu</li>
                                        <li>Enter your master password if prompted (you can set a new one)</li>
                                        <li>In the left sidebar, expand <strong>Servers</strong> → <strong>PostgreSQL 16</strong></li>
                                        <li>Right-click on <strong>Databases</strong> → <strong>Create</strong> → <strong>Database...</strong></li>
                                        <li>In the "Database" field, type: <code>school_db</code></li>
                                        <li>Click <strong>Save</strong></li>
                                    </ol>
                                    <div className="info-box success">
                                        <CheckCircle size={18} />
                                        Done! Your database <code>school_db</code> is now created.
                                    </div>
                                </div>

                                <div className="substep">
                                    <strong>Method 2: Using Command Line (Advanced)</strong>
                                    <ol>
                                        <li>Open Command Prompt (press <kbd>Win + R</kbd>, type <code>cmd</code>)</li>
                                        <li>Run this command:</li>
                                    </ol>
                                    <div className="code-block">
                                        <Terminal size={16} />
                                        <code>psql -U postgres -c "CREATE DATABASE school_db;"</code>
                                    </div>
                                    <p>Enter your postgres password when prompted.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Step 5: Get Connection Details */}
                    <section className="guide-section">
                        <div className="section-header step-number">
                            <div className="step-badge">5</div>
                            <h2>Your Database Connection Details</h2>
                        </div>

                        <div className="step-content">
                            <p>Use these details when setting up your school platform:</p>

                            <div className="connection-details">
                                <div className="detail-row">
                                    <span className="detail-label">Host:</span>
                                    <code className="detail-value">localhost</code>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Port:</span>
                                    <code className="detail-value">5432</code>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Database Name:</span>
                                    <code className="detail-value">school_db</code>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Username:</span>
                                    <code className="detail-value">postgres</code>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Password:</span>
                                    <code className="detail-value">[Your password from Step 2]</code>
                                </div>
                            </div>

                            <div className="info-box tip">
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Lightbulb size={18} /> Next Step:
                                </strong>
                                Go back to the setup wizard and enter these details in the Database Configuration form, then click "Test Database Connection".
                            </div>
                        </div>
                    </section>

                    {/* Troubleshooting */}
                    <section className="guide-section">
                        <div className="section-header">
                            <AlertCircle size={24} />
                            <h2>Common Issues & Solutions</h2>
                        </div>

                        <div className="troubleshooting-list">
                            <div className="trouble-item">
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <XCircle size={18} /> "psql is not recognized as a command"
                                </strong>
                                <p><strong>Solution:</strong> PostgreSQL command line tools are not in your PATH. Use pgAdmin instead, or add PostgreSQL to your system PATH.</p>
                            </div>

                            <div className="trouble-item">
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <XCircle size={18} /> "Connection refused" or "Server not running"
                                </strong>
                                <p><strong>Solution:</strong> PostgreSQL service is not running. Open Services (<code>services.msc</code>), find "postgresql-x64-16", right-click and select "Start".</p>
                            </div>

                            <div className="trouble-item">
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <XCircle size={18} /> "Password authentication failed"
                                </strong>
                                <p><strong>Solution:</strong> You're using the wrong password. Try resetting the postgres user password using pgAdmin or reinstall PostgreSQL.</p>
                            </div>

                            <div className="trouble-item">
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <XCircle size={18} /> "Database already exists"
                                </strong>
                                <p><strong>Solution:</strong> The database <code>school_db</code> was already created. You can use it as-is, or delete it first and create a new one.</p>
                            </div>
                        </div>
                    </section>

                    {/* Need Help */}
                    <section className="guide-section">
                        <div className="help-box">
                            <h3>Still Need Help?</h3>
                            <p>If you're having trouble with the setup, consider these options:</p>
                            <ul>
                                <li>Watch video tutorials on YouTube: Search for "Install PostgreSQL Windows"</li>
                                <li>Contact your IT support team</li>
                                <li>Use a cloud database service (like Supabase, AWS RDS, or ElephantSQL) instead of local installation</li>
                            </ul>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="guide-footer">
                    <button onClick={() => navigate(-1)} className="primary-button">
                        <CheckCircle size={20} />
                        Back to Setup Wizard
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DatabaseSetupGuide
