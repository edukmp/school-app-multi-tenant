import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    DollarSign,
    Calendar,
    FileText,
    BookOpen,
    Bus,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    School
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTenant } from '../../contexts/TenantContext'
import '../../styles/sidebar.scss'

interface MenuItem {
    path: string
    icon: React.ReactNode
    label: string
    badge?: number
}

const Sidebar: React.FC = () => {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { tenant } = useTenant()
    const [collapsed, setCollapsed] = useState(false)

    const menuItems: MenuItem[] = [
        {
            path: '/admin',
            icon: <LayoutDashboard size={20} />,
            label: 'Dashboard'
        },
        {
            path: '/admin/students',
            icon: <Users size={20} />,
            label: 'Students'
        },
        {
            path: '/admin/teachers',
            icon: <GraduationCap size={20} />,
            label: 'Teachers'
        },
        {
            path: '/admin/finance',
            icon: <DollarSign size={20} />,
            label: 'Finance'
        },
        {
            path: '/admin/academic',
            icon: <BookOpen size={20} />,
            label: 'Academic'
        },
        {
            path: '/admin/calendar',
            icon: <Calendar size={20} />,
            label: 'Calendar'
        },
        {
            path: '/admin/documents',
            icon: <FileText size={20} />,
            label: 'Documents'
        },
        {
            path: '/admin/transport',
            icon: <Bus size={20} />,
            label: 'Transport'
        }
    ]

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await logout()
            navigate('/admin/login')
        }
    }

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* Header */}
            <div className="sidebar-header">
                <div className="logo-container">
                    {tenant?.theme_config?.logo ? (
                        <img src={tenant.theme_config.logo} alt={tenant.name} className="logo-img" />
                    ) : (
                        <div className="logo-placeholder">
                            <School size={32} />
                        </div>
                    )}
                    {!collapsed && (
                        <div className="school-info">
                            <h2 className="school-name">{tenant?.name || 'School Portal'}</h2>
                            <p className="school-type">Admin Dashboard</p>
                        </div>
                    )}
                </div>
                <button
                    className="toggle-btn"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                <ul className="menu-list">
                    {menuItems.map((item) => (
                        <li key={item.path} className="menu-item">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
                                title={collapsed ? item.label : ''}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                {!collapsed && (
                                    <>
                                        <span className="menu-label">{item.label}</span>
                                        {item.badge && <span className="menu-badge">{item.badge}</span>}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <NavLink
                    to="/admin/settings"
                    className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
                    title={collapsed ? 'Settings' : ''}
                >
                    <span className="menu-icon"><Settings size={20} /></span>
                    {!collapsed && <span className="menu-label">Settings</span>}
                </NavLink>

                <button className="menu-link logout-btn" onClick={handleLogout} title={collapsed ? 'Logout' : ''}>
                    <span className="menu-icon"><LogOut size={20} /></span>
                    {!collapsed && <span className="menu-label">Logout</span>}
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
