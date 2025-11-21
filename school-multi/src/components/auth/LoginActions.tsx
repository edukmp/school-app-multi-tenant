import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LogIn, User, Loader2 } from 'lucide-react'
import './LoginActions.scss'

interface LoginActionsProps {
    variant?: 'default' | 'compact'
    onSuccess?: () => void
    onError?: (error: string) => void
}

interface ToastMessage {
    id: number
    type: 'success' | 'error' | 'info'
    message: string
}

const LoginActions: React.FC<LoginActionsProps> = ({
    variant = 'default',
    onSuccess,
    onError
}) => {
    const { loginWithGoogle } = useAuth()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    const addToast = (type: ToastMessage['type'], message: string) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, type, message }])

        // Auto remove toast after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id))
        }, 5000)
    }

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true)
            addToast('info', 'Mengarahkan ke Google Sign-In...')

            await loginWithGoogle()

            addToast('success', 'Login berhasil! Redirecting...')
            onSuccess?.()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login gagal. Silakan coba lagi.'
            addToast('error', errorMessage)
            onError?.(errorMessage)
            console.error('Google login failed:', error)
        } finally {
            // Keep loading state a bit longer for redirect
            setTimeout(() => setIsLoading(false), 1000)
        }
    }

    const handleStaffLogin = () => {
        try {
            addToast('info', 'Mengarahkan ke halaman staff login...')
            setTimeout(() => {
                navigate('/auth/login')
            }, 500)
        } catch (error) {
            addToast('error', 'Terjadi kesalahan. Silakan coba lagi.')
        }
    }

    if (variant === 'compact') {
        return (
            <>
                <div className="login-actions login-actions--compact">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="login-actions__btn login-actions__btn--google"
                        aria-label="Login dengan Google"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="login-actions__icon login-actions__icon--spin" size={18} />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <svg className="login-actions__icon" viewBox="0 0 24 24" width="18" height="18">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleStaffLogin}
                        disabled={isLoading}
                        className="login-actions__btn login-actions__btn--staff"
                        aria-label="Staff Login"
                    >
                        <User className="login-actions__icon" size={18} />
                        Staff
                    </button>
                </div>

                <ToastContainer toasts={toasts} onRemove={removeToast} />
            </>
        )
    }

    return (
        <>
            <div className="login-actions">
                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="login-actions__btn login-actions__btn--google login-actions__btn--primary"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="login-actions__icon login-actions__icon--spin" size={20} />
                            <span>Connecting to Google...</span>
                        </>
                    ) : (
                        <>
                            <svg className="login-actions__icon" viewBox="0 0 24 24" width="20" height="20">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span>Login dengan Google</span>
                        </>
                    )}
                </button>

                <button
                    onClick={handleStaffLogin}
                    disabled={isLoading}
                    className="login-actions__btn login-actions__btn--staff login-actions__btn--outline"
                >
                    <LogIn className="login-actions__icon" size={20} />
                    <span>Staff Login</span>
                </button>
            </div>

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    )
}

// Toast Container Component
interface ToastContainerProps {
    toasts: ToastMessage[]
    onRemove: (id: number) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    )
}

// Toast Component
interface ToastProps {
    toast: ToastMessage
    onRemove: (id: number) => void
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return '✓'
            case 'error':
                return '✕'
            case 'info':
                return 'ℹ'
            default:
                return 'ℹ'
        }
    }

    return (
        <div className={`toast toast--${toast.type}`} role="alert">
            <div className="toast__icon">{getIcon()}</div>
            <div className="toast__message">{toast.message}</div>
            <button
                className="toast__close"
                onClick={() => onRemove(toast.id)}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    )
}

export default LoginActions
