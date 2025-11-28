import React, { useState } from 'react'
import { Check, Database, Mail, Settings, ArrowRight, ArrowLeft } from 'lucide-react'
import { supabase } from '../../services/supabase'
import '../../styles/tenant-setup.scss'

interface SetupStep {
    id: number
    title: string
    description: string
    icon: React.ReactNode
}

interface TenantSetupData {
    // Step 1: Manager Account
    email: string
    tempPassword: string

    // Step 2: Database
    dbConnectionMode: 'simple' | 'advanced'
    dbName: string
    dbHost: string
    dbPort: string
    dbUser: string
    dbPassword: string
    connectionString: string

    // Step 3: Initial Data
    installExampleData: boolean

    // Step 4: Optional Setup
    tenantName: string
    logo: File | null
}

const TenantSetup: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0)
    const [setupData, setSetupData] = useState<TenantSetupData>({
        email: '',
        tempPassword: '',
        dbConnectionMode: 'simple',
        dbName: '',
        dbHost: 'localhost',
        dbPort: '5432',
        dbUser: '',
        dbPassword: '',
        connectionString: '',
        installExampleData: false,
        tenantName: '',
        logo: null
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const steps: SetupStep[] = [
        {
            id: 0,
            title: 'Manager Account',
            description: 'Setup tenant manager credentials',
            icon: <Mail size={24} />
        },
        {
            id: 1,
            title: 'Database Setup',
            description: 'Configure database connection',
            icon: <Database size={24} />
        },
        {
            id: 2,
            title: 'Initial Data',
            description: 'Create tables and sample data',
            icon: <Settings size={24} />
        },
        {
            id: 3,
            title: 'Tenant Info',
            description: 'Optional tenant customization',
            icon: <Check size={24} />
        }
    ]

    const handleInputChange = (field: keyof TenantSetupData, value: any) => {
        setSetupData(prev => ({ ...prev, [field]: value }))
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSetupData(prev => ({ ...prev, logo: e.target.files![0] }))
        }
    }

    const handleSendResetLink = async () => {
        if (!setupData.email || !setupData.tempPassword) return

        setIsSubmitting(true)
        try {
            const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin

            // 1. Try to sign up the user first with temp password
            const { error: signUpError } = await supabase.auth.signUp({
                email: setupData.email,
                password: setupData.tempPassword,
                options: {
                    data: {
                        role: 'admin' // Default role for tenant manager
                    },
                    emailRedirectTo: `${redirectUrl}/auth/login`
                }
            })

            if (signUpError) {
                // If user already exists, we proceed to send reset link
                // Otherwise throw error
                if (!signUpError.message.toLowerCase().includes('already registered')) {
                    throw signUpError
                }
            }

            // 2. Send password reset email to force password change
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(setupData.email, {
                redirectTo: `${redirectUrl}/auth/reset-password`,
            })

            if (resetError) throw resetError

            setEmailSent(true)
            // alert(`Akun berhasil diproses. Link reset password telah dikirim ke ${setupData.email}.`)
        } catch (error) {
            console.error('Error handling tenant account:', error)
            alert('Gagal memproses akun tenant. ' + (error instanceof Error ? error.message : ''))
        } finally {
            setIsSubmitting(false)
        }
    }

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 0:
                return setupData.email !== '' && setupData.tempPassword !== '' && emailSent
            case 1:
                if (setupData.dbConnectionMode === 'simple') {
                    return setupData.dbName !== '' && setupData.dbHost !== '' &&
                        setupData.dbPort !== '' && setupData.dbUser !== '' &&
                        setupData.dbPassword !== ''
                } else {
                    return setupData.connectionString !== ''
                }
            case 2:
                return true // Always valid
            case 3:
                return true // Optional step, always valid
            default:
                return false
        }
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
        }
    }

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0))
    }

    const handleSkipOptional = async () => {
        // Set default values for optional fields
        const defaultTenantName = `Tenant-${Date.now()}`
        setSetupData(prev => ({
            ...prev,
            tenantName: prev.tenantName || defaultTenantName
        }))
        await handleFinish()
    }

    const handleFinish = async () => {
        setIsSubmitting(true)
        // Simulate API call to create tenant
        await new Promise(resolve => setTimeout(resolve, 2000))
        alert('Tenant setup completed successfully!')
        setIsSubmitting(false)
    }

    return (
        <div className="tenant-setup">
            <div className="tenant-setup__container">
                {/* Progress Steps */}
                <div className="setup-progress">
                    <div className="setup-progress__steps">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`setup-progress__step ${index === currentStep ? 'setup-progress__step--active' : ''
                                    } ${index < currentStep ? 'setup-progress__step--completed' : ''}`}
                            >
                                <div className="setup-progress__step-icon">
                                    {index < currentStep ? <Check size={20} /> : step.icon}
                                </div>
                                <div className="setup-progress__step-content">
                                    <div className="setup-progress__step-title">{step.title}</div>
                                    <div className="setup-progress__step-description">{step.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Setup Card */}
                <div className="setup-card">
                    <div className="setup-card__header">
                        <h1 className="setup-card__title">{steps[currentStep].title}</h1>
                        <p className="setup-card__subtitle">{steps[currentStep].description}</p>
                    </div>

                    <div className="setup-card__body">
                        {/* Step 0: Manager Account */}
                        {currentStep === 0 && (
                            <div className="setup-form">
                                <div className="setup-form__group">
                                    <label className="setup-form__label">
                                        Tenant Manager Email <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="setup-form__input"
                                        placeholder="manager@example.com"
                                        value={setupData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                    />
                                    <p className="setup-form__hint">
                                        This email will be used for the tenant manager account
                                    </p>
                                </div>

                                <div className="setup-form__group">
                                    <label className="setup-form__label">
                                        Temporary Password <span className="required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="setup-form__input"
                                        placeholder="Enter a temporary password"
                                        value={setupData.tempPassword}
                                        onChange={(e) => handleInputChange('tempPassword', e.target.value)}
                                    />
                                    <p className="setup-form__hint">
                                        This password will be used initially. A reset link will be sent to the email.
                                    </p>
                                </div>

                                <div className="setup-form__action-box">
                                    <div className="setup-form__action-box-content">
                                        <Mail className="setup-form__action-box-icon" />
                                        <div>
                                            <h3 className="setup-form__action-box-title">Send Password Reset Link</h3>
                                            <p className="setup-form__action-box-text">
                                                The tenant manager will receive an email to set their own password
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        className={`btn btn-secondary ${emailSent ? 'btn-success' : ''}`}
                                        onClick={handleSendResetLink}
                                        disabled={!setupData.email || isSubmitting || emailSent}
                                    >
                                        {isSubmitting ? 'Sending...' : emailSent ? '✓ Sent' : 'Send Reset Link'}
                                    </button>
                                </div>

                                {emailSent && (
                                    <div className="setup-form__success-message">
                                        <Check size={20} />
                                        Password reset link has been sent to {setupData.email}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 1: Database Setup */}
                        {currentStep === 1 && (
                            <div className="setup-form">
                                <div className="setup-form__toggle">
                                    <button
                                        className={`setup-form__toggle-btn ${setupData.dbConnectionMode === 'simple' ? 'setup-form__toggle-btn--active' : ''
                                            }`}
                                        onClick={() => handleInputChange('dbConnectionMode', 'simple')}
                                    >
                                        Simple Mode
                                    </button>
                                    <button
                                        className={`setup-form__toggle-btn ${setupData.dbConnectionMode === 'advanced' ? 'setup-form__toggle-btn--active' : ''
                                            }`}
                                        onClick={() => handleInputChange('dbConnectionMode', 'advanced')}
                                    >
                                        Advanced Mode
                                    </button>
                                </div>

                                {setupData.dbConnectionMode === 'simple' ? (
                                    <>
                                        <div className="setup-form__row">
                                            <div className="setup-form__group">
                                                <label className="setup-form__label">
                                                    Database Name <span className="required">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="setup-form__input"
                                                    placeholder="my_tenant_db"
                                                    value={setupData.dbName}
                                                    onChange={(e) => handleInputChange('dbName', e.target.value)}
                                                />
                                            </div>

                                            <div className="setup-form__group">
                                                <label className="setup-form__label">
                                                    Host <span className="required">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="setup-form__input"
                                                    placeholder="localhost"
                                                    value={setupData.dbHost}
                                                    onChange={(e) => handleInputChange('dbHost', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="setup-form__row">
                                            <div className="setup-form__group">
                                                <label className="setup-form__label">
                                                    Port <span className="required">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="setup-form__input"
                                                    placeholder="5432"
                                                    value={setupData.dbPort}
                                                    onChange={(e) => handleInputChange('dbPort', e.target.value)}
                                                />
                                            </div>

                                            <div className="setup-form__group">
                                                <label className="setup-form__label">
                                                    Database User <span className="required">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="setup-form__input"
                                                    placeholder="postgres"
                                                    value={setupData.dbUser}
                                                    onChange={(e) => handleInputChange('dbUser', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="setup-form__group">
                                            <label className="setup-form__label">
                                                Database Password <span className="required">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="setup-form__input"
                                                placeholder="Enter database password"
                                                value={setupData.dbPassword}
                                                onChange={(e) => handleInputChange('dbPassword', e.target.value)}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="setup-form__group">
                                        <label className="setup-form__label">
                                            Connection String <span className="required">*</span>
                                        </label>
                                        <textarea
                                            className="setup-form__textarea"
                                            placeholder="postgresql://user:password@host:port/database"
                                            rows={4}
                                            value={setupData.connectionString}
                                            onChange={(e) => handleInputChange('connectionString', e.target.value)}
                                        />
                                        <p className="setup-form__hint">
                                            Enter your full PostgreSQL connection string
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Initial Data */}
                        {currentStep === 2 && (
                            <div className="setup-form">
                                <div className="setup-form__info-box">
                                    <Database className="setup-form__info-box-icon" />
                                    <div>
                                        <h3 className="setup-form__info-box-title">Database Migration</h3>
                                        <p className="setup-form__info-box-text">
                                            We'll create all necessary tables and schema for your tenant database
                                        </p>
                                    </div>
                                </div>

                                <div className="setup-form__checkbox-card">
                                    <input
                                        type="checkbox"
                                        id="exampleData"
                                        className="setup-form__checkbox"
                                        checked={setupData.installExampleData}
                                        onChange={(e) => handleInputChange('installExampleData', e.target.checked)}
                                    />
                                    <label htmlFor="exampleData" className="setup-form__checkbox-label">
                                        <div>
                                            <h3 className="setup-form__checkbox-title">Install Example Data</h3>
                                            <p className="setup-form__checkbox-text">
                                                Include sample students, teachers, classes, and other data to help you get started
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                <div className="setup-form__preview">
                                    <h4 className="setup-form__preview-title">What will be created:</h4>
                                    <ul className="setup-form__preview-list">
                                        <li>
                                            <Check size={16} />
                                            Database tables and schema
                                        </li>
                                        <li>
                                            <Check size={16} />
                                            User roles and permissions
                                        </li>
                                        <li>
                                            <Check size={16} />
                                            System configuration
                                        </li>
                                        {setupData.installExampleData && (
                                            <>
                                                <li>
                                                    <Check size={16} />
                                                    Sample students and teachers
                                                </li>
                                                <li>
                                                    <Check size={16} />
                                                    Example classes and schedules
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Tenant Info (Optional) */}
                        {currentStep === 3 && (
                            <div className="setup-form">
                                <div className="setup-form__optional-badge">
                                    Optional - You can configure this later
                                </div>

                                <div className="setup-form__group">
                                    <label className="setup-form__label">Tenant Name</label>
                                    <input
                                        type="text"
                                        className="setup-form__input"
                                        placeholder="Default: Tenant-{timestamp}"
                                        value={setupData.tenantName}
                                        onChange={(e) => handleInputChange('tenantName', e.target.value)}
                                    />
                                    <p className="setup-form__hint">
                                        This name will be displayed across the application
                                    </p>
                                </div>

                                <div className="setup-form__group">
                                    <label className="setup-form__label">Tenant Logo</label>
                                    <div className="setup-form__file-upload">
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            className="setup-form__file-input"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                        />
                                        <label htmlFor="logo-upload" className="setup-form__file-label">
                                            <div className="setup-form__file-placeholder">
                                                {setupData.logo ? (
                                                    <div className="setup-form__file-preview">
                                                        <img
                                                            src={URL.createObjectURL(setupData.logo)}
                                                            alt="Logo preview"
                                                            className="setup-form__file-preview-img"
                                                        />
                                                        <span>{setupData.logo.name}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Database size={32} />
                                                        <span>Click to upload logo</span>
                                                        <span className="setup-form__file-hint">PNG, JPG up to 5MB</span>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="setup-card__footer">
                        <button
                            className="btn btn-outline"
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                        >
                            <ArrowLeft size={18} />
                            Previous
                        </button>

                        <div className="setup-card__footer-actions">
                            {currentStep === steps.length - 1 && (
                                <button
                                    className="btn btn-outline"
                                    onClick={handleSkipOptional}
                                    disabled={isSubmitting}
                                >
                                    Skip & Finish
                                </button>
                            )}

                            {currentStep < steps.length - 1 ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleNext}
                                    disabled={!validateStep(currentStep)}
                                >
                                    Next Step
                                    <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleFinish}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating Tenant...' : 'Complete Setup'}
                                    <Check size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TenantSetup
