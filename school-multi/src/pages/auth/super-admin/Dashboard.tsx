import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { PlatformStats, Tenant } from '../../../types'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Redirect jika bukan super admin
    if (user && user.role !== 'super_admin') {
      navigate('/')
      return
    }

    loadDashboardData()
  }, [user, navigate])

  const loadDashboardData = async (): Promise<void> => {
    try {
      // Mock data - dalam production, fetch dari API
      const mockStats: PlatformStats = {
        total_tenants: 5,
        total_students: 1250,
        total_payments: 345,
        active_modules: ['academic', 'payment', 'meeting', 'library']
      }

      const mockTenants: Tenant[] = [
        {
          id: '1',
          name: 'Sekolah Alam Bogor',
          subdomain: 'alam-bogor',
          theme_config: { primaryColor: '#10b981' },
          active_modules: ['academic', 'payment', 'meeting']
        },
        {
          id: '2',
          name: 'Sekolah Citra Berkat',
          subdomain: 'citra-berkat',
          theme_config: { primaryColor: '#3b82f6' },
          active_modules: ['academic', 'payment']
        },
        {
          id: '3',
          name: 'Sekolah Global Jaya',
          subdomain: 'global-jaya',
          theme_config: { primaryColor: '#ef4444' },
          active_modules: ['academic', 'payment', 'meeting', 'library']
        }
      ]

      setStats(mockStats)
      setTenants(mockTenants)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading Super Admin Dashboard..." />
  }

  if (!stats) {
    return <div>Failed to load dashboard data</div>
  }

  return (
    <div className="super-admin-dashboard">
      <div className="dashboard-header">
        <h1>Super Administrator Dashboard</h1>
        <p>Platform Management & Monitoring</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3>{stats.total_tenants}</h3>
            <p>Total Sekolah</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3>{stats.total_students.toLocaleString()}</h3>
            <p>Total Siswa</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{stats.total_payments}</h3>
            <p>Pembayaran Bulan Ini</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔧</div>
          <div className="stat-content">
            <h3>{stats.active_modules.length}</h3>
            <p>Active Modules</p>
          </div>
        </div>
      </div>

      {/* Tenants Management */}
      <div className="tenants-section">
        <div className="section-header">
          <h2>Managed Schools</h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/tenant/setup')}
          >
            + Add New School
          </button>
        </div>

        <div className="tenants-grid">
          {tenants.map(tenant => (
            <div key={tenant.id} className="tenant-card">
              <div className="tenant-header">
                <h3>{tenant.name}</h3>
                <span
                  className="tenant-color"
                  style={{ backgroundColor: tenant.theme_config.primaryColor }}
                ></span>
              </div>

              <div className="tenant-details">
                <p><strong>Subdomain:</strong> {tenant.subdomain}.sekolahku.com</p>
                <p><strong>Active Modules:</strong> {tenant.active_modules.join(', ')}</p>
              </div>

              <div className="tenant-actions">
                <button className="btn btn-outline btn-sm">View Details</button>
                <button className="btn btn-outline btn-sm">Manage</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-card">
            <div className="action-icon">📊</div>
            <span>Platform Analytics</span>
          </button>
          <button className="action-card">
            <div className="action-icon">💰</div>
            <span>Billing & Payments</span>
          </button>
          <button className="action-card">
            <div className="action-icon">🔧</div>
            <span>Module Management</span>
          </button>
          <button className="action-card">
            <div className="action-icon">👥</div>
            <span>User Management</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard