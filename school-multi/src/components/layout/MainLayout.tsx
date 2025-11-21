import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
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
  active?: boolean
}

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navItems: NavItem[] = [
    { icon: <LayoutDashboard size={22} />, label: 'Dashboard', active: true },
    { icon: <FileText size={22} />, label: 'Documents' },
    { icon: <CalendarDays size={22} />, label: 'Calendar' },
    { icon: <Settings size={22} />, label: 'Settings' },
    { icon: <Bell size={22} />, label: 'Notifications' }
  ]

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
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
            <button
              key={index}
              className={`sidebar__nav-item ${item.active ? 'sidebar__nav-item--active' : ''}`}
              onClick={closeSidebarOnMobile}
              aria-label={item.label}
            >
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span className="sidebar__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          className="sidebar__nav-item sidebar__nav-item--bottom"
          onClick={closeSidebarOnMobile}
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
