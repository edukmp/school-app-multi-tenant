import React, { useState } from 'react'
import {
  Users,
  GraduationCap,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react'
import '../../styles/admin-dashboard.scss'
import { useTenant } from '../../contexts/TenantContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week')
  const { tenant, loading: tenantLoading } = useTenant()

  // Use tenant data or defaults
  const schoolName = tenant?.name || 'School Management System'
  const logo = tenant?.theme_config?.logo || null
  // Note: CSS variables are set globally by TenantContext

  if (tenantLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Mock data - replace with real data from Supabase
  const stats = [
    {
      title: 'Total Students',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: GraduationCap,
      color: '#3b82f6'
    },
    {
      title: 'Total Teachers',
      value: '89',
      change: '+5%',
      trend: 'up',
      icon: Users,
      color: '#10b981'
    },
    {
      title: 'Active Classes',
      value: '42',
      change: '+8%',
      trend: 'up',
      icon: Calendar,
      color: '#f59e0b'
    },
    {
      title: 'Documents',
      value: '567',
      change: '+23%',
      trend: 'up',
      icon: FileText,
      color: '#8b5cf6'
    }
  ]

  const recentActivities = [
    { id: 1, type: 'student', message: 'New student enrolled: John Doe', time: '5 minutes ago', status: 'success' },
    { id: 2, type: 'payment', message: 'Payment received from Jane Smith', time: '15 minutes ago', status: 'success' },
    { id: 3, type: 'document', message: 'New document uploaded: Report Card Q1', time: '1 hour ago', status: 'info' },
    { id: 4, type: 'meeting', message: 'Parent-Teacher meeting scheduled', time: '2 hours ago', status: 'warning' },
    { id: 5, type: 'system', message: 'System backup completed', time: '3 hours ago', status: 'success' }
  ]

  const upcomingEvents = [
    { id: 1, title: 'Parent-Teacher Meeting', date: '2024-12-10', time: '09:00 AM', attendees: 45 },
    { id: 2, title: 'Science Exam', date: '2024-12-12', time: '10:30 AM', attendees: 120 },
    { id: 3, title: 'Sports Day', date: '2024-12-15', time: '08:00 AM', attendees: 300 },
    { id: 4, title: 'Annual Function', date: '2024-12-20', time: '06:00 PM', attendees: 500 }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="status-icon success" />
      case 'warning':
        return <AlertCircle size={16} className="status-icon warning" />
      case 'info':
        return <Clock size={16} className="status-icon info" />
      default:
        return null
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          {logo ? (
            <img src={logo} alt="School Logo" className="dashboard-logo" />
          ) : (
            <div className="dashboard-logo-placeholder" style={{
              width: '56px',
              height: '56px',
              borderRadius: '8px',
              background: 'var(--primary-color, #667eea)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {schoolName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="dashboard-title">{schoolName}</h1>
            <p className="dashboard-subtitle">Welcome back! Here's what's happening with your school.</p>
          </div>
        </div>
        <div className="header-actions">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-primary">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.title}</p>
                <div className="stat-value-row">
                  <h3 className="stat-value">{stat.value}</h3>
                  <span className={`stat-change ${stat.trend}`}>
                    <TrendingUp size={14} />
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Recent Activities</h2>
            <button className="btn-text">View All</button>
          </div>
          <div className="activities-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                {getStatusIcon(activity.status)}
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Events</h2>
            <button className="btn-text">View Calendar</button>
          </div>
          <div className="events-list">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-date">
                  <span className="event-day">{new Date(event.date).getDate()}</span>
                  <span className="event-month">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="event-details">
                  <h4 className="event-title">{event.title}</h4>
                  <p className="event-info">
                    <Clock size={14} />
                    {event.time} • {event.attendees} attendees
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => alert('Add Student feature coming soon!')}>
            <Users size={20} />
            <span>Add Student</span>
          </button>
          <button className="quick-action-btn" onClick={() => alert('Schedule Event feature coming soon!')}>
            <Calendar size={20} />
            <span>Schedule Event</span>
          </button>
          <button className="quick-action-btn" onClick={() => alert('Upload Document feature coming soon!')}>
            <FileText size={20} />
            <span>Upload Document</span>
          </button>
          <button className="quick-action-btn" onClick={() => alert('Record Payment feature coming soon!')}>
            <DollarSign size={20} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
