import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, Plus, MapPin, Users } from 'lucide-react'
import '../../styles/placeholder-page.scss'

const TransportPage: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="placeholder-page">
            <div className="placeholder-header">
                <div className="icon-wrapper">
                    <Bus size={48} />
                </div>
                <h1>Transport Management</h1>
                <p className="subtitle">Manage school buses, routes, and transportation</p>
            </div>

            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">
                        <Bus size={32} />
                    </div>
                    <h3>Fleet Management</h3>
                    <p>Track and manage school buses and vehicles</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">
                        <MapPin size={32} />
                    </div>
                    <h3>Route Planning</h3>
                    <p>Configure bus routes and pickup/drop-off points</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">
                        <Users size={32} />
                    </div>
                    <h3>Student Assignment</h3>
                    <p>Assign students to buses and manage transportation fees</p>
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

export default TransportPage
