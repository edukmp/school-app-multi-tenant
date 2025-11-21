import React from 'react'

import { Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useTenant } from './contexts/TenantContext'
// Layout Components
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import SuperAdminLayout from './components/layout/SuperAdminLayout'
// Page Components
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import SuperAdminLogin from './pages/auth/SuperAdminLogin'
import GoogleAuthCallback from './pages/auth/GoogleAuthCallback'
import ParentDashboard from './pages/parent/Dashboard'
import PaymentUploadPage from './pages/parent/PaymentUploadPage'
import StudentBindingPage from './pages/parent/StudentBindingPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import SuperAdminDashboard from './pages/super-admin/Dashboard'
import TenantSetup from './pages/tenant/TenantSetup'
import LoadingSpinner from './components/common/LoadingSpinner'

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const { tenant, loading: tenantLoading } = useTenant()
  if (authLoading || tenantLoading) {
    return <LoadingSpinner />
  }
  return (
    <div className={`app tenant-${tenant?.id}`}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="auth">
            <Route path="login" element={<LoginPage />} />
            <Route path="super-admin" element={<SuperAdminLogin />} />
            <Route path="google-callback" element={<GoogleAuthCallback />} />
          </Route>
        </Route>
        {/* Tenant Setup - Accessible for super admin or during initial setup */}
        <Route path="/tenant/setup" element={<TenantSetup />} />
        {/* Super Admin Routes */}
        {user?.role === 'super_admin' && (
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            {/* Tambah routes super admin lainnya di sini */}
          </Route>
        )}
        {/* Parent Routes */}
        {user?.role === 'parent' && (
          <Route path="/parent" element={<AuthLayout />}>
            <Route index element={<ParentDashboard />} />
            <Route path="payments/upload" element={<PaymentUploadPage />} />
            <Route path="students/binding" element={<StudentBindingPage />} />
          </Route>
        )}
        {/* Admin Routes */}
        {user?.role === 'admin' && (
          <Route path="/admin" element={<AuthLayout />}>
            <Route index element={<AdminDashboard />} />
          </Route>
        )}
        {/* 404 Route */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </div>
  )
}

export default App