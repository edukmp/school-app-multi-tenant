import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Settings,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
}

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const location = useLocation()

  const navItems: NavItem[] = [
    { icon: <LayoutDashboard size={22} />, label: 'Dashboard', path: '/' },
    { icon: <FileText size={22} />, label: 'Documents', path: '/documents' },
    { icon: <CalendarDays size={22} />, label: 'Calendar', path: '/calendar' },
    { icon: <Settings size={22} />, label: 'Settings', path: '/settings' },
    { icon: <Bell size={22} />, label: 'Notifications', path: '/notifications' }
  ]

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = async () => {
    console.log('Logout handler called')
    try {
      await logout()
      console.log('Logout completed successfully')
      closeSidebarOnMobile()
    } catch (error) {
      console.error('Error during logout:', error)
      alert('Logout failed. Please try again.')
    }
  }

  return (
    <div className="app-shell">
      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`app-shell__sidebar ${isSidebarOpen ? 'app-shell__sidebar--open' : ''}`}>
        <div className="sidebar__logo">S</div>

        <nav className="sidebar__nav">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`sidebar__nav-item ${isActive(item.path) ? 'sidebar__nav-item--active' : ''}`}
              onClick={closeSidebarOnMobile}
              aria-label={item.label}
            >
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span className="sidebar__nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <button
          className="sidebar__nav-item sidebar__nav-item--bottom"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <span className="sidebar__nav-icon">
            <LogOut size={22} />
          </span>
          <span className="sidebar__nav-label">Logout</span>
        </button>
      </aside>

      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
