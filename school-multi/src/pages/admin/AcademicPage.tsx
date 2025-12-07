import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Plus, Calendar, FileText, Award } from 'lucide-react'
import '../../styles/placeholder-page.scss'

const AcademicPage: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="placeholder-page">
            <div className="placeholder-header">
                <div className="icon-wrapper">
                    <BookOpen size={48} />
                </div>
                <h1>Academic Management</h1>
                <p className="subtitle">Manage curriculum, grades, and academic schedules</p>
            </div>

            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">
                        <Calendar size={32} />
                    </div>
                    <h3>Academic Calendar</h3>
                    <p>Manage academic year, semesters, and important dates</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">
                        <FileText size={32} />
                    </div>
                    <h3>Curriculum</h3>
                    <p>Configure subjects, syllabi, and learning materials</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">
                        <Award size={32} />
                    </div>
                    <h3>Grading System</h3>
                    <p>Set up grading scales, assessments, and report cards</p>
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

export default AcademicPage
