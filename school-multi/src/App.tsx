import React from 'react'
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
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
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import CompleteProfilePage from './pages/auth/CompleteProfilePage'
import ParentDashboard from './pages/parent/Dashboard'
import PaymentUploadPage from './pages/parent/PaymentUploadPage'
import StudentBindingPage from './pages/parent/StudentBindingPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import SuperAdminDashboard from './pages/super-admin/Dashboard'
import LoginDocumentation from './pages/super-admin/LoginDocumentation'
import TenantSetup from './pages/tenant/TenantSetup'
import TenantOnboarding from './pages/tenant/TenantOnboarding'
import DatabaseSetupGuide from './pages/tenant/DatabaseSetupGuide'
import LoadingSpinner from './components/common/LoadingSpinner'
// Student Management
import StudentsList from './pages/admin/students/StudentsList'
import StudentForm from './pages/admin/students/StudentForm'
import StudentDetail from './pages/admin/students/StudentDetail'
// Placeholder Pages
import TeachersList from './pages/admin/teachers/TeachersList'
import TeacherForm from './pages/admin/teachers/TeacherForm'
import TeacherDetail from './pages/admin/teachers/TeacherDetail'
// Placeholder Pages
// import TeachersPage from './pages/admin/TeachersPage'
import FinancePage from './pages/admin/FinancePage'
import AcademicPage from './pages/admin/AcademicPage'
import TransportPage from './pages/admin/TransportPage'

// Helper component for admin route protection
const AdminRoute = ({ user }: { user: any }) => {
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  return <Navigate to="/admin/login" replace />;
};

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const { tenant, loading: tenantLoading } = useTenant()
  const location = useLocation()
  const navigate = useNavigate()

  // Auto-redirect admin users based on profile status
  React.useEffect(() => {
    if (authLoading || !user || user.role !== 'admin') return

    const isOnboarding = location.pathname.startsWith('/tenant/onboarding')


    // If profile IS completed -> Prevent access to onboarding
    if (user.is_profile_completed && isOnboarding) {
      console.log('Redirecting complete admin to dashboard')
      navigate('/admin', { replace: true })
    }
  }, [user, authLoading, location.pathname, navigate])


  if (authLoading || tenantLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className={`app tenant-${tenant?.id}`}>
      <Routes>
        {/* Landing Page - Show when not logged in */}
        {!user && <Route path="/" element={<LandingPage />} />}

        {/* Public Routes - Outside MainLayout */}
        <Route path="/auth/google-callback" element={<GoogleAuthCallback />} />

        {/* User Login */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/login" element={<Navigate to="/login" replace />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<TenantLogin />} />
        <Route path="/auth/tenant-login" element={<Navigate to="/admin/login" replace />} />

        <Route path="/auth/super-admin" element={<SuperAdminLogin />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Routes - Inside MainLayout */}
        {user && (
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        )}

        {/* Profile Completion */}
        <Route path="/complete-profile" element={
          user ? <CompleteProfilePage /> : <Navigate to="/login" replace />
        } />

        {/* SUPER ADMIN ROUTES */}
        {user?.role === 'super_admin' && (
          <>
            {/* Tenant Setup is now exclusive to Super Admin */}
            <Route path="/tenant/setup" element={<TenantSetup />} />

            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="login-docs" element={<LoginDocumentation />} />
            </Route>
          </>
        )}

        {/* PARENT ROUTES */}
        {user?.role === 'parent' && (
          <Route path="/parent" element={<AuthLayout />}>
            <Route index element={<ParentDashboard />} />
            <Route path="payments/upload" element={<PaymentUploadPage />} />
            <Route path="students/binding" element={<StudentBindingPage />} />
          </Route>
        )}

        {/* ADMIN (TENANT) ROUTES */}

        {/* Onboarding is protected for admins */}
        <Route path="/tenant/onboarding" element={
          user?.role === 'admin' ? <TenantOnboarding /> : <Navigate to="/admin/login" replace />
        } />

        {/* Database Setup Guide - Public */}
        <Route path="/help/database-setup" element={<DatabaseSetupGuide />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AuthLayout />}>
          <Route index element={<AdminRoute user={user} />} />
          {/* Students Management */}
          <Route path="students" element={<StudentsList />} />
          <Route path="students/add" element={<StudentForm />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="students/:id/edit" element={<StudentForm />} />
          {/* Placeholder Pages */}
          {/* Teachers Management */}
          <Route path="teachers" element={<TeachersList />} />
          <Route path="teachers/add" element={<TeacherForm />} />
          <Route path="teachers/:id" element={<TeacherDetail />} />
          <Route path="teachers/:id/edit" element={<TeacherForm />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="academic" element={<AcademicPage />} />
          <Route path="transport" element={<TransportPage />} />
          {/* Shared Pages */}
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </div>
  )
}

export default App