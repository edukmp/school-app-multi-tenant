import React, { useState } from 'react'
import { Bell, Check, Trash2, AlertCircle, Info } from 'lucide-react'

interface Notification {
    id: string
    title: string
    message: string
    time: string
    type: 'info' | 'success' | 'warning' | 'error'
    read: boolean
    category: 'system' | 'event' | 'message' | 'reminder'
}

const NotificationsPage: React.FC = () => {
    const [filter, setFilter] = useState<string>('all')
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'New Assignment Posted',
            message: 'Mathematics homework for Chapter 5 has been posted. Due date: Jan 30',
            time: '5 minutes ago',
            type: 'info',
            read: false,
            category: 'system'
        },
        {
            id: '2',
            title: 'Grade Updated',
            message: 'Your Science exam grade has been updated. Score: 95/100',
            time: '1 hour ago',
            type: 'success',
            read: false,
            category: 'system'
        },
        {
            id: '3',
            title: 'Upcoming Event',
            message: 'Parent-Teacher meeting scheduled for tomorrow at 2:00 PM',
            time: '2 hours ago',
            type: 'warning',
            read: true,
            category: 'event'
        },
        {
            id: '4',
            title: 'New Message',
            message: 'Sarah Johnson sent you a message regarding project collaboration',
            time: '3 hours ago',
            type: 'info',
            read: true,
            category: 'message'
        },
        {
            id: '5',
            title: 'Payment Reminder',
            message: 'School fee payment due in 3 days. Amount: $450',
            time: '1 day ago',
            type: 'warning',
            read: false,
            category: 'reminder'
        },
        {
            id: '6',
            title: 'Attendance Alert',
            message: 'Your attendance percentage has dropped below 75%',
            time: '2 days ago',
            type: 'error',
            read: true,
            category: 'system'
        }
    ])

    const filterOptions = [
        { value: 'all', label: 'All' },
        { value: 'unread', label: 'Unread' },
        { value: 'system', label: 'System' },
        { value: 'event', label: 'Events' },
        { value: 'message', label: 'Messages' },
        { value: 'reminder', label: 'Reminders' }
    ]

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'all') return true
        if (filter === 'unread') return !notif.read
        return notif.category === filter
    })

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ))
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })))
    }

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(notif => notif.id !== id))
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <Check size={20} />
            case 'warning':
                return <AlertCircle size={20} />
            case 'error':
                return <AlertCircle size={20} />
            default:
                return <Info size={20} />
        }
    }

    const getNotificationColor = (type: string) => {
        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        }
        return colors[type as keyof typeof colors]
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-subtitle">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={markAllAsRead}>
                    <Check size={20} />
                    Mark All as Read
                </button>
            </div>

            <div className="notifications-toolbar">
                <div className="filter-tabs">
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            className={`filter-tab ${filter === option.value ? 'filter-tab--active' : ''}`}
                            onClick={() => setFilter(option.value)}
                        >
                            {option.label}
                            {option.value === 'unread' && unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={64} />
                        <h3>No notifications</h3>
                        <p>You're all caught up! No {filter !== 'all' ? filter : ''} notifications to display.</p>
                    </div>
                ) : (
                    filteredNotifications.map(notif => (
                        <div
                            key={notif.id}
                            className={`notification-item ${!notif.read ? 'notification-item--unread' : ''}`}
                        >
                            <div
                                className="notification-icon"
                                style={{
                                    backgroundColor: `${getNotificationColor(notif.type)}15`,
                                    color: getNotificationColor(notif.type)
                                }}
                            >
                                {getNotificationIcon(notif.type)}
                            </div>

                            <div className="notification-content">
                                <div className="notification-header">
                                    <h3>{notif.title}</h3>
                                    {!notif.read && <span className="unread-indicator" />}
                                </div>
                                <p>{notif.message}</p>
                                <div className="notification-footer">
                                    <span className="notification-time">{notif.time}</span>
                                    <span className="notification-category">{notif.category}</span>
                                </div>
                            </div>

                            <div className="notification-actions">
                                {!notif.read && (
                                    <button
                                        className="action-btn"
                                        onClick={() => markAsRead(notif.id)}
                                        title="Mark as read"
                                    >
                                        <Check size={18} />
                                    </button>
                                )}
                                <button
                                    className="action-btn action-btn--danger"
                                    onClick={() => deleteNotification(notif.id)}
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {filteredNotifications.length > 0 && (
                <div className="notifications-footer">
                    <p>Showing {filteredNotifications.length} of {notifications.length} notifications</p>
                </div>
            )}
        </div>
    )
}

export default NotificationsPage
