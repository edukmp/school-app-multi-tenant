import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setSuccess(true)
            setTimeout(() => {
                navigate('/auth/login')
            }, 2000)
        } catch (err: any) {
            setError(err.message || 'Failed to update password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Set New Password</h1>
                    <p className="subtitle">Please enter your new password below.</p>
                </div>

                {success ? (
                    <div className="success-message" style={{ color: 'green', textAlign: 'center', padding: '1rem', background: '#e6ffe6', borderRadius: '4px' }}>
                        Password updated successfully! Redirecting to login...
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="login-form">
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="Enter new password"
                            />
                        </div>

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? <LoadingSpinner size="sm" /> : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default ResetPasswordPage
