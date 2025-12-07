import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, Plus, TrendingUp, CreditCard, Receipt } from 'lucide-react'
import '../../styles/placeholder-page.scss'

const FinancePage: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="placeholder-page">
            <div className="placeholder-header">
                <div className="icon-wrapper">
                    <DollarSign size={48} />
                </div>
                <h1>Finance Management</h1>
                <p className="subtitle">Manage tuition fees, payments, and financial reports</p>
            </div>

            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">
                        <CreditCard size={32} />
                    </div>
                    <h3>Payment Processing</h3>
                    <p>Handle tuition payments, invoices, and payment tracking</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">
                        <Receipt size={32} />
                    </div>
                    <h3>Fee Structure</h3>
                    <p>Configure and manage fee structures for different grades and programs</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">
                        <TrendingUp size={32} />
                    </div>
                    <h3>Financial Reports</h3>
                    <p>Generate comprehensive financial reports and analytics</p>
                </div>
            </div>

            <div className="coming-soon-banner">
                <h2>🚧 Coming Soon</h2>
                <p>This feature is currently under development</p>
                <button className="btn btn-primary" onClick={() => navigate('/admin')}>
                    <Plus size={20} />
                    Back to Dashboard
                </button>
            </div>
        </div>
    )
}

export default FinancePage
