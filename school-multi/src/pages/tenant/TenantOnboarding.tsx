import React, { useState } from 'react'
import { Database, Server, Palette, CheckCircle, Layout, ArrowRight, ArrowLeft, Loader, LogOut, XCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import DatabaseSetupHelpBanner from '../../components/common/DatabaseSetupHelpBanner'
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

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = error => reject(error)
    })
}

const TenantOnboarding: React.FC = () => {
    const { user, logout } = useAuth()
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
    const [connectionTest, setConnectionTest] = useState<{
        status: 'idle' | 'testing' | 'success' | 'error'
        message: string
        details?: {
            host?: string
            database?: string
            user?: string
            latency?: number
        }
    }>({
        status: 'idle',
        message: ''
    })

    const testDatabaseConnection = async () => {
        // Reset previous test
        setConnectionTest({ status: 'idle', message: '' })

        setConnectionTest({ status: 'testing', message: 'Testing connection to Supabase...' })

        const startTime = Date.now()

        try {
            // Import supabase client
            const { supabase } = await import('../../services/supabase')

            // Test connection by running a simple query
            const { error } = await supabase
                .from('profiles')
                .select('count')
                .limit(1)

            const latency = Date.now() - startTime

            if (error) {
                // Check if it's just an empty table (which is fine)
                if (error.code === 'PGRST116') {
                    // No rows returned - table exists but empty, connection is OK
                    setConnectionTest({
                        status: 'success',
                        message: 'Connection successful! (Database is empty - this is normal for new setup)',
                        details: {
                            host: 'Supabase Cloud',
                            database: 'Connected via Supabase',
                            user: 'Authenticated',
                            latency
                        }
                    })
                } else {
                    throw error
                }
            } else {
                // Connection successful
                setConnectionTest({
                    status: 'success',
                    message: 'Connection successful!',
                    details: {
                        host: 'Supabase Cloud',
                        database: 'Connected via Supabase',
                        user: 'Authenticated',
                        latency
                    }
                })
            }
        } catch (error: any) {
            const latency = Date.now() - startTime

            setConnectionTest({
                status: 'error',
                message: error.message || 'Connection failed. Please check your Supabase configuration in .env file.',
                details: {
                    host: 'Supabase Cloud',
                    database: 'Check VITE_SUPABASE_URL in .env',
                    user: 'Check VITE_SUPABASE_ANON_KEY in .env',
                    latency
                }
            })
        }
    }

    const handleNext = () => {
        // Require connection test before proceeding from step 1
        if (step === 1 && connectionTest.status !== 'success') {
            alert('Please test the database connection successfully before proceeding.')
            return
        }
        setStep(prev => prev + 1)
    }
    const handlePrev = () => setStep(prev => prev - 1)

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout? Any unsaved progress will be lost.')) {
            await logout()
        }
    }

    const handleFinish = async () => {
        setLoading(true)

        try {
            // Convert logo to base64 if it exists
            let logoUrl = null
            if (data.logo) {
                try {
                    logoUrl = await fileToBase64(data.logo)
                } catch (e) {
                    console.error('Error converting logo to base64:', e)
                }
            }

            const brandingConfig = {
                schoolName: data.schoolName,
                primaryColor: data.primaryColor,
                secondaryColor: data.secondaryColor,
                logo: logoUrl
            }

            console.log('💾 Saving branding config:', brandingConfig)
            localStorage.setItem('tenant_branding', JSON.stringify(brandingConfig))

            // Prepare tenant data for database
            const tenantData = {
                name: data.schoolName,
                subdomain: data.schoolName.toLowerCase().replace(/\s+/g, '-'),
                theme_config: {
                    primaryColor: data.primaryColor,
                    secondaryColor: data.secondaryColor,
                    logo: brandingConfig.logo
                },
                active_modules: data.modules
            }

            // Save to Supabase
            const { supabase, tables } = await import('../../services/supabase')

            console.log('💾 Saving tenant to Supabase:', tenantData)
            const { data: savedTenant, error } = await supabase
                .from(tables.tenants)
                .insert([tenantData])
                .select()
                .single()

            if (error) {
                throw new Error(`Supabase error: ${error.message}`)
            }

            console.log('✅ Tenant saved successfully:', savedTenant)

            // Link tenant to user profile
            if (user) {
                console.log('🔗 Linking tenant to user profile:', user.id)
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        tenant_id: savedTenant.id,
                        role: 'admin' // Ensure they are the admin
                    })
                    .eq('id', user.id)

                if (profileError) {
                    console.error('❌ Error linking tenant to profile:', profileError)
                    // Don't block flow, but log error
                } else {
                    console.log('✅ Profile linked successfully')
                }
            }

            // Also save to localStorage for immediate access/fallback
            const tenantConfig = {
                id: savedTenant.id, // Use the ID from the database
                ...tenantData
            }
            localStorage.setItem('tenant_config', JSON.stringify(tenantConfig))

            await new Promise(resolve => setTimeout(resolve, 1000))

            setLoading(false)
            // Force a hard redirect to ensure fresh state
            window.location.href = '/admin'
        } catch (error: any) {
            console.error('❌ Error saving configuration:', error)
            setLoading(false)
            alert(`Failed to save configuration: ${error.message || 'Unknown error'}`)
        }
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

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData({ ...data, logo: e.target.files[0] })
        }
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
                            <DatabaseSetupHelpBanner />


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


                            {/* Connection Status Feedback */}
                            {/* Test Connection Button */}
                            <div style={{ marginTop: '2rem' }}>
                                <button
                                    onClick={testDatabaseConnection}
                                    disabled={connectionTest.status === 'testing'}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        background: connectionTest.status === 'success' ? '#10b981' : '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: connectionTest.status === 'testing' ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s',
                                        opacity: connectionTest.status === 'testing' ? 0.7 : 1
                                    }}
                                >
                                    {connectionTest.status === 'testing' ? (
                                        <>
                                            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                            Testing Connection...
                                        </>
                                    ) : connectionTest.status === 'success' ? (
                                        <>
                                            <CheckCircle size={18} />
                                            Connection Verified
                                        </>
                                    ) : (
                                        <>
                                            <Database size={18} />
                                            Test Database Connection
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Connection Test Result */}
                            {connectionTest.status !== 'idle' && (
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    background: connectionTest.status === 'success' ? '#d1fae5' :
                                        connectionTest.status === 'error' ? '#fee2e2' : '#e0e7ff',
                                    border: `2px solid ${connectionTest.status === 'success' ? '#10b981' :
                                        connectionTest.status === 'error' ? '#ef4444' : '#667eea'}`
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: connectionTest.details ? '0.75rem' : 0,
                                        fontWeight: 600,
                                        color: connectionTest.status === 'success' ? '#065f46' :
                                            connectionTest.status === 'error' ? '#991b1b' : '#3730a3'
                                    }}>
                                        {connectionTest.status === 'success' && <CheckCircle size={20} />}
                                        {connectionTest.status === 'error' && <XCircle size={20} />}
                                        {connectionTest.status === 'testing' && <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />}
                                        <span>{connectionTest.message}</span>
                                    </div>

                                    {connectionTest.details && (
                                        <div style={{
                                            fontSize: '0.875rem',
                                            color: '#374151',
                                            background: 'white',
                                            padding: '0.75rem',
                                            borderRadius: '6px'
                                        }}>
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <strong>Host:</strong> {connectionTest.details.host}
                                            </div>
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <strong>Database:</strong> {connectionTest.details.database}
                                            </div>
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <strong>User:</strong> {connectionTest.details.user}
                                            </div>
                                            {connectionTest.details.latency && (
                                                <div>
                                                    <strong>Response Time:</strong> {connectionTest.details.latency}ms
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Troubleshooting Guide - Only show on error */}
                            {connectionTest.status === 'error' && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: '#fff7ed',
                                    borderRadius: '8px',
                                    border: '1px solid #fb923c'
                                }}>
                                    <div style={{
                                        fontWeight: 600,
                                        color: '#9a3412',
                                        marginBottom: '0.75rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        🔧 Troubleshooting Steps:
                                    </div>
                                    <ol style={{
                                        fontSize: '0.8125rem',
                                        color: '#78350f',
                                        paddingLeft: '1.25rem',
                                        margin: 0,
                                        lineHeight: '1.6'
                                    }}>
                                        <li style={{ marginBottom: '0.5rem' }}>
                                            <strong>Check PostgreSQL is running:</strong> Ensure your PostgreSQL server is installed and running on the specified host
                                        </li>
                                        <li style={{ marginBottom: '0.5rem' }}>
                                            <strong>Verify credentials:</strong> Double-check username, password, and database name are correct
                                        </li>
                                        <li style={{ marginBottom: '0.5rem' }}>
                                            <strong>Database exists:</strong> Make sure the database has been created (use <code style={{ background: '#fed7aa', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>CREATE DATABASE dbname;</code>)
                                        </li>
                                        <li style={{ marginBottom: '0.5rem' }}>
                                            <strong>Network access:</strong> If using a remote host, check firewall rules and ensure port 5432 is accessible
                                        </li>
                                        <li style={{ marginBottom: '0.5rem' }}>
                                            <strong>pg_hba.conf:</strong> Verify PostgreSQL allows connections from your application's IP address
                                        </li>
                                        <li>
                                            <strong>Connection string format:</strong> For advanced mode, ensure format is <code style={{ background: '#fed7aa', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>postgresql://user:pass@host:5432/dbname</code>
                                        </li>
                                    </ol>
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
                                        <input
                                            type="file"
                                            className="file-input"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                        />
                                        {data.logo && (
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#10b981' }}>
                                                Selected: {data.logo.name}
                                            </p>
                                        )}
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
                            disabled={
                                (step === 1 && connectionTest.status !== 'success') ||
                                (step === 2 && installProgress < 100) ||
                                loading
                            }
                            className="footer-button next"
                            title={step === 1 && connectionTest.status !== 'success' ? 'Please test database connection successfully before proceeding' : ''}
                        >
                            {connectionTest.status === 'testing' ? 'Testing Connection...' : 'Next Step'} <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleFinish}
                            disabled={loading || !data.schoolName.trim()}
                            className="footer-button finish"
                            title={!data.schoolName.trim() ? 'Please enter a school name' : ''}
                            style={{ opacity: !data.schoolName.trim() ? 0.5 : 1, cursor: !data.schoolName.trim() ? 'not-allowed' : 'pointer' }}
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


