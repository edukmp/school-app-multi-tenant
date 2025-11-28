import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useTenant } from './contexts/TenantContext'
// Layout Components
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import SuperAdminLayout from './components/layout/SuperAdminLayout'
import LandingPage from './pages/LandingPage'
// Page Components
import HomePage from './pages/HomePage'
import DocumentsPage from './pages/DocumentsPage'
import CalendarPage from './pages/CalendarPage'
import SettingsPage from './pages/SettingsPage'
import NotificationsPage from './pages/NotificationsPage'
import LoginPage from './pages/auth/LoginPage'
import TenantLogin from './pages/auth/TenantLogin'
import SuperAdminLogin from './pages/auth/SuperAdminLogin'
import GoogleAuthCallback from './pages/auth/GoogleAuthCallback'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import ParentDashboard from './pages/parent/Dashboard'
import PaymentUploadPage from './pages/parent/PaymentUploadPage'
import StudentBindingPage from './pages/parent/StudentBindingPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import SuperAdminDashboard from './pages/super-admin/Dashboard'
import TenantSetup from './pages/tenant/TenantSetup'
import TenantOnboarding from './pages/tenant/TenantOnboarding'
import LoadingSpinner from './components/common/LoadingSpinner'

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const { tenant, loading: tenantLoading } = useTenant()
  const location = useLocation()

  if (authLoading || tenantLoading) {
    return <LoadingSpinner />
  }

  // Allow access to public routes even if not logged in
  const publicRoutes = [
    '/auth/google-callback',
    '/auth/login',
    '/auth/tenant-login',
    '/auth/super-admin',
    '/auth/reset-password'
  ]
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route))

  if (!user && !isPublicRoute) {
    return <LandingPage />
  }

  return (
    <div className={`app tenant-${tenant?.id}`}>
      <Routes>
        {/* Public Routes - Outside MainLayout */}
        <Route path="/auth/google-callback" element={<GoogleAuthCallback />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/tenant-login" element={<TenantLogin />} />
        <Route path="/auth/super-admin" element={<SuperAdminLogin />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes - Inside MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Tenant Setup - Accessible for super admin or during initial setup */}
        <Route path="/tenant/setup" element={<TenantSetup />} />

        {/* Tenant Onboarding - Accessible for tenant admin after login */}
        <Route path="/tenant/onboarding" element={<TenantOnboarding />} />

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