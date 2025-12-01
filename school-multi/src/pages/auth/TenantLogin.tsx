import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { supabase } from '../../services/supabase'

interface DiagnosticResult {
    test: string
    status: 'pending' | 'success' | 'error' | 'timeout'
    message: string
    duration?: number
}

const TenantLogin: React.FC = () => {
    const { loginWithEmail } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showDiagnostics, setShowDiagnostics] = useState(false)
    const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])

    // Auto-run diagnostics on mount to check connection
    useEffect(() => {
        runQuickCheck()
    }, [])

    const runQuickCheck = async () => {
        const startTime = Date.now()
        try {
            const { error } = await Promise.race([
                supabase.from('profiles').select('count', { count: 'exact', head: true }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Quick check timeout')), 5000))
            ]) as any

            if (error) {
                console.warn('⚠️ Quick connection check failed:', error)
            } else {
                console.log('✅ Quick connection check passed in', Date.now() - startTime, 'ms')
            }
        } catch (err) {
            console.error('❌ Quick connection check error:', err)
        }
    }

    const runDiagnostics = async () => {
        setShowDiagnostics(true)
        setDiagnostics([])

        const tests: DiagnosticResult[] = []

        // Test 1: Supabase URL reachability
        const addTest = (result: DiagnosticResult) => {
            tests.push(result)
            setDiagnostics([...tests])
        }

        addTest({ test: 'Checking Supabase URL', status: 'pending', message: 'Testing...' })
        const urlTest = await testSupabaseUrl()
        tests[tests.length - 1] = urlTest
        setDiagnostics([...tests])

        // Test 2: Database connection
        addTest({ test: 'Database Connection', status: 'pending', message: 'Testing...' })
        const dbTest = await testDatabaseConnection()
        tests[tests.length - 1] = dbTest
        setDiagnostics([...tests])

        // Test 3: Auth endpoint
        addTest({ test: 'Auth Service', status: 'pending', message: 'Testing...' })
        const authTest = await testAuthService()
        tests[tests.length - 1] = authTest
        setDiagnostics([...tests])

        // Test 4: Profiles table access
        addTest({ test: 'Profiles Table Access', status: 'pending', message: 'Testing...' })
        const profileTest = await testProfilesAccess()
        tests[tests.length - 1] = profileTest
        setDiagnostics([...tests])
    }

    const testSupabaseUrl = async (): Promise<DiagnosticResult> => {
        const startTime = Date.now()
        try {
            const url = import.meta.env.VITE_SUPABASE_URL
            const response = await Promise.race([
                fetch(url),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
            ]) as Response

            const duration = Date.now() - startTime
            return {
                test: 'Checking Supabase URL',
                status: 'success',
                message: `URL reachable (${response.status}) in ${duration}ms`,
                duration
            }
        } catch (err: any) {
            return {
                test: 'Checking Supabase URL',
                status: err.message === 'timeout' ? 'timeout' : 'error',
                message: err.message === 'timeout' ? 'URL timeout after 5s' : `Error: ${err.message}`,
                duration: Date.now() - startTime
            }
        }
    }

    const testDatabaseConnection = async (): Promise<DiagnosticResult> => {
        const startTime = Date.now()
        try {
            const { error } = await Promise.race([
                supabase.from('profiles').select('count', { count: 'exact', head: true }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
            ]) as any

            const duration = Date.now() - startTime
            if (error) throw error

            return {
                test: 'Database Connection',
                status: 'success',
                message: `Connected successfully in ${duration}ms`,
                duration
            }
        } catch (err: any) {
            return {
                test: 'Database Connection',
                status: err.message === 'timeout' ? 'timeout' : 'error',
                message: err.message === 'timeout' ? 'Database timeout after 10s' : `Error: ${err.message}`,
                duration: Date.now() - startTime
            }
        }
    }

    const testAuthService = async (): Promise<DiagnosticResult> => {
        const startTime = Date.now()
        try {
            const { error } = await Promise.race([
                supabase.auth.getSession(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
            ]) as any

            const duration = Date.now() - startTime
            if (error) throw error

            return {
                test: 'Auth Service',
                status: 'success',
                message: `Auth service responsive in ${duration}ms`,
                duration
            }
        } catch (err: any) {
            return {
                test: 'Auth Service',
                status: err.message === 'timeout' ? 'timeout' : 'error',
                message: err.message === 'timeout' ? 'Auth service timeout after 10s' : `Error: ${err.message}`,
                duration: Date.now() - startTime
            }
        }
    }

    const testProfilesAccess = async (): Promise<DiagnosticResult> => {
        const startTime = Date.now()
        try {
            const { error } = await Promise.race([
                supabase.from('profiles').select('id').limit(1),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
            ]) as any

            const duration = Date.now() - startTime
            if (error) throw error

            return {
                test: 'Profiles Table Access',
                status: 'success',
                message: `Table accessible in ${duration}ms`,
                duration
            }
        } catch (err: any) {
            return {
                test: 'Profiles Table Access',
                status: err.message === 'timeout' ? 'timeout' : 'error',
                message: err.message === 'timeout' ? 'Table access timeout after 10s' : `Error: ${err.message}`,
                duration: Date.now() - startTime
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        console.log('🔐 Starting login attempt...')
        const loginStartTime = Date.now()

        try {
            const result = await loginWithEmail(formData.email, formData.password)

            const loginDuration = Date.now() - loginStartTime
            console.log(`⏱️ Login attempt completed in ${loginDuration}ms`)

            if (result.success) {
                console.log('✅ Login successful, redirecting to onboarding...')
                // Use window.location.href for reliable redirect
                window.location.href = '/tenant/onboarding'
            } else {
                console.error('❌ Login failed:', result.error)
                setError(result.error || 'Login failed')
            }
        } catch (err: any) {
            const loginDuration = Date.now() - loginStartTime
            console.error(`❌ Login exception after ${loginDuration}ms:`, err)
            setError(`Login error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        if (window.confirm('This will clear all local data and reload the page. Continue?')) {
            localStorage.clear()
            sessionStorage.clear()
            window.location.reload()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="login-container">
            <div className="login-card" style={{ maxWidth: showDiagnostics ? '600px' : '400px' }}>
                <div className="login-header">
                    <p className="eyebrow-text">School Administration</p>
                    <h1>Tenant Login</h1>
                    <p className="subtitle">Sign in to configure and manage your school</p>
                </div>

                {showDiagnostics ? (
                    <div className="diagnostics-panel" style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                        <h3 style={{ marginTop: 0 }}>Connection Diagnostics</h3>
                        {diagnostics.map((result, idx) => (
                            <div key={idx} style={{
                                padding: '0.75rem',
                                marginBottom: '0.5rem',
                                background: 'white',
                                borderRadius: '4px',
                                borderLeft: `4px solid ${result.status === 'success' ? '#10b981' :
                                    result.status === 'error' ? '#ef4444' :
                                        result.status === 'timeout' ? '#f59e0b' : '#6b7280'
                                    }`
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                    {result.status === 'pending' && '⏳ '}
                                    {result.status === 'success' && '✅ '}
                                    {result.status === 'error' && '❌ '}
                                    {result.status === 'timeout' && '⏱️ '}
                                    {result.test}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    {result.message}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => setShowDiagnostics(false)}
                            style={{ marginTop: '1rem', width: '100%' }}
                            className="login-button"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <form className="login-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="error-message">
                                <div>{error}</div>
                                {(error.toLowerCase().includes('time') || error.toLowerCase().includes('network')) && (
                                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', fontSize: '0.875rem' }}>
                                        <button
                                            type="button"
                                            onClick={runDiagnostics}
                                            style={{ textDecoration: 'underline', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            Run Diagnostics
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            style={{ textDecoration: 'underline', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            Reset App
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="admin@school.edu"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-button"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : 'Sign in to Dashboard'}
                        </button>

                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <button
                                type="button"
                                onClick={runDiagnostics}
                                style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    textDecoration: 'underline',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Having connection issues? Run diagnostics
                            </button>
                        </div>
                    </form>
                )}

                <div className="login-footer">
                    <p>
                        <a href="/auth/login" className="link">
                            ← Back to main login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default TenantLogin
