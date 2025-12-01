import React, { useState } from 'react'
import { Database, Server, Palette, CheckCircle, Layout, ArrowRight, ArrowLeft, Loader, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/onboarding.scss'

interface OnboardingData {
    dbMode: 'simple' | 'advanced'
    dbName: string
    dbHost: string
    dbUser: string
    dbPass: string
    dbString: string
    installTables: boolean
    seedExampleData: boolean
    schoolName: string
    primaryColor: string
    secondaryColor: string
    logo: File | null
    modules: string[]
}

const TenantOnboarding: React.FC = () => {
    const { logout } = useAuth()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<OnboardingData>({
        dbMode: 'simple',
        dbName: '',
        dbHost: 'localhost',
        dbUser: 'postgres',
        dbPass: '',
        dbString: '',
        installTables: true,
        seedExampleData: false,
        schoolName: '',
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        logo: null,
        modules: ['academic', 'students']
    })

    const [installProgress, setInstallProgress] = useState(0)
    const [installStatus, setInstallStatus] = useState('')

    const handleNext = () => setStep(prev => prev + 1)
    const handlePrev = () => setStep(prev => prev - 1)

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout? Any unsaved progress will be lost.')) {
            await logout()
        }
    }

    const handleFinish = async () => {
        setLoading(true)
        // Simulate saving configuration
        await new Promise(resolve => setTimeout(resolve, 2000))
        setLoading(false)
        // Force a hard redirect to ensure fresh state
        window.location.href = '/admin'
    }

    const runInstallation = async () => {
        setLoading(true)
        setInstallStatus('Connecting to database...')
        setInstallProgress(10)
        await new Promise(r => setTimeout(r, 1000))

        setInstallStatus('Creating schemas and tables...')
        setInstallProgress(40)
        await new Promise(r => setTimeout(r, 1500))

        if (data.seedExampleData) {
            setInstallStatus('Seeding example data...')
            setInstallProgress(70)
            await new Promise(r => setTimeout(r, 1500))
        }

        setInstallStatus('Installation complete!')
        setInstallProgress(100)
        setLoading(false)
    }

    const toggleModule = (mod: string) => {
        setData(prev => ({
            ...prev,
            modules: prev.modules.includes(mod)
                ? prev.modules.filter(m => m !== mod)
                : [...prev.modules, mod]
        }))
    }

    const steps = [
        { n: 1, label: 'Database', icon: Database },
        { n: 2, label: 'Initialization', icon: Server },
        { n: 3, label: 'Branding', icon: Palette }
    ]

    return (
        <div className="onboarding-container">
            <div className="onboarding-wizard">
                {/* Header */}
                <div className="onboarding-header" style={{ position: 'relative' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '1.5rem',
                            background: 'transparent',
                            border: '1px solid #e5e7eb',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}
                        className="hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                    <h1>School Setup Wizard</h1>
                    <p>Complete these steps to launch your school platform</p>
                </div>

                {/* Step Progress Indicator */}
                <div className="step-progress-container">
                    <div className="step-progress">
                        {/* Progress Line */}
                        <div
                            className="step-progress-line"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((s) => (
                            <div
                                key={s.n}
                                className={`step-item ${step === s.n ? 'active' :
                                    step > s.n ? 'completed' :
                                        ''
                                    }`}
                            >
                                <div className="step-circle">
                                    {step > s.n ? <CheckCircle size={20} /> : s.n}
                                </div>
                                <div className="step-label">
                                    <s.icon size={20} className="step-icon" />
                                    <span className="step-title">{s.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="onboarding-content">
                    {/* STEP 1: DATABASE */}
                    {step === 1 && (
                        <div>
                            <h2>Database Configuration</h2>
                            <p>Configure where your school's data will be stored.</p>

                            <div className="config-mode-selector">
                                <button
                                    onClick={() => setData({ ...data, dbMode: 'simple' })}
                                    className={`mode-button ${data.dbMode === 'simple' ? 'active' : ''}`}
                                >
                                    Simple Configuration
                                </button>
                                <button
                                    onClick={() => setData({ ...data, dbMode: 'advanced' })}
                                    className={`mode-button ${data.dbMode === 'advanced' ? 'active' : ''}`}
                                >
                                    Connection String
                                </button>
                            </div>

                            {data.dbMode === 'simple' ? (
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label>Host</label>
                                        <input
                                            type="text"
                                            value={data.dbHost}
                                            onChange={e => setData({ ...data, dbHost: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Database Name</label>
                                        <input
                                            type="text"
                                            value={data.dbName}
                                            onChange={e => setData({ ...data, dbName: e.target.value })}
                                            placeholder="school_db"
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>User</label>
                                        <input
                                            type="text"
                                            value={data.dbUser}
                                            onChange={e => setData({ ...data, dbUser: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            value={data.dbPass}
                                            onChange={e => setData({ ...data, dbPass: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="form-field">
                                    <label>PostgreSQL Connection String</label>
                                    <textarea
                                        rows={4}
                                        placeholder="postgresql://user:password@host:port/dbname"
                                        value={data.dbString}
                                        onChange={e => setData({ ...data, dbString: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: INITIALIZATION */}
                    {step === 2 && (
                        <div>
                            <h2>System Initialization</h2>

                            {!installProgress ? (
                                <div>
                                    <div className="checkbox-option">
                                        <input
                                            type="checkbox"
                                            id="seed"
                                            checked={data.seedExampleData}
                                            onChange={e => setData({ ...data, seedExampleData: e.target.checked })}
                                        />
                                        <div>
                                            <label htmlFor="seed">Install Example Data</label>
                                            <p>Populate the database with sample students, teachers, and classes.</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={runInstallation}
                                        disabled={loading}
                                        className="install-button"
                                    >
                                        {loading ? <Loader className="animate-spin" /> : <Server size={20} />}
                                        Start Installation
                                    </button>
                                </div>
                            ) : (
                                <div className="progress-bar-container">
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill" style={{ width: `${installProgress}%` }}></div>
                                    </div>
                                    <p className="progress-status">{installStatus}</p>
                                    {installProgress === 100 && (
                                        <div className="progress-complete">
                                            <CheckCircle /> Database is ready!
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: BRANDING */}
                    {step === 3 && (
                        <div>
                            <h2>Branding & Modules</h2>

                            <div className="branding-grid">
                                <div>
                                    <div className="form-field" style={{ marginBottom: '1rem' }}>
                                        <label>School Name</label>
                                        <input
                                            type="text"
                                            value={data.schoolName}
                                            onChange={e => setData({ ...data, schoolName: e.target.value })}
                                            placeholder="e.g. Harapan Bangsa School"
                                        />
                                    </div>

                                    <div className="color-picker-group">
                                        <div className="form-field">
                                            <label>Primary Color</label>
                                            <div className="color-picker">
                                                <input
                                                    type="color"
                                                    value={data.primaryColor}
                                                    onChange={e => setData({ ...data, primaryColor: e.target.value })}
                                                />
                                                <span>{data.primaryColor}</span>
                                            </div>
                                        </div>
                                        <div className="form-field">
                                            <label>Secondary Color</label>
                                            <div className="color-picker">
                                                <input
                                                    type="color"
                                                    value={data.secondaryColor}
                                                    onChange={e => setData({ ...data, secondaryColor: e.target.value })}
                                                />
                                                <span>{data.secondaryColor}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-field" style={{ marginTop: '1rem' }}>
                                        <label>School Logo</label>
                                        <input type="file" className="file-input" accept="image/*" />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Active Modules</label>
                                    <div className="module-list">
                                        {['Academic', 'Students', 'Teachers', 'Finance', 'Library', 'Transport'].map(mod => (
                                            <label key={mod} className="module-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={data.modules.includes(mod.toLowerCase())}
                                                    onChange={() => toggleModule(mod.toLowerCase())}
                                                />
                                                <span>{mod} Module</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="onboarding-footer">
                    <button
                        onClick={handlePrev}
                        disabled={step === 1 || loading}
                        className="footer-button back"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={(step === 2 && installProgress < 100) || loading}
                            className="footer-button next"
                        >
                            Next Step <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleFinish}
                            disabled={loading}
                            className="footer-button finish"
                        >
                            {loading ? 'Saving...' : 'Launch Dashboard'} <Layout size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TenantOnboarding
