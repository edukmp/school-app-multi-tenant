import React, { useState } from 'react'
import { User, Bell, Lock, Moon, Mail, Shield, Database, Save } from 'lucide-react'

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile')
    const [settings, setSettings] = useState({
        // Profile
        fullName: 'John Doe',
        email: 'john.doe@school.com',
        phone: '+1 234 567 8900',
        role: 'Teacher',

        // Notifications
        emailNotifications: true,
        pushNotifications: true,
        weeklyReport: false,
        eventReminders: true,

        // Appearance
        darkMode: false,
        language: 'en',
        timezone: 'UTC-5',

        // Privacy
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
    })

    const [isSaving, setIsSaving] = useState(false)

    const handleSave = () => {
        setIsSaving(true)
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false)
            alert('Settings saved successfully!')
        }, 1000)
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'appearance', label: 'Appearance', icon: Moon },
        { id: 'privacy', label: 'Privacy', icon: Shield },
    ]

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your account settings and preferences</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    <Save size={20} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="settings-layout">
                <div className="settings-sidebar">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                className={`settings-tab ${activeTab === tab.id ? 'settings-tab--active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={20} />
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>

                <div className="settings-content">
                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <h2 className="section-title">Profile Information</h2>
                            <p className="section-description">Update your personal information and profile details</p>

                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={settings.fullName}
                                    onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={settings.email}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={settings.phone}
                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            <div className="form-group">
                                <label>Role</label>
                                <input
                                    type="text"
                                    value={settings.role}
                                    disabled
                                    className="input-disabled"
                                />
                                <small>Contact admin to change your role</small>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h2 className="section-title">Notification Preferences</h2>
                            <p className="section-description">Choose how you want to receive notifications</p>

                            <div className="settings-group">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <Mail size={20} />
                                        <div>
                                            <h4>Email Notifications</h4>
                                            <p>Receive notifications via email</p>
                                        </div>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={settings.emailNotifications}
                                            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <Bell size={20} />
                                        <div>
                                            <h4>Push Notifications</h4>
                                            <p>Receive push notifications on your device</p>
                                        </div>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={settings.pushNotifications}
                                            onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <Database size={20} />
                                        <div>
                                            <h4>Weekly Report</h4>
                                            <p>Receive weekly activity summary</p>
                                        </div>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={settings.weeklyReport}
                                            onChange={(e) => setSettings({ ...settings, weeklyReport: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <Bell size={20} />
                                        <div>
                                            <h4>Event Reminders</h4>
                                            <p>Get reminded about upcoming events</p>
                                        </div>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={settings.eventReminders}
                                            onChange={(e) => setSettings({ ...settings, eventReminders: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <h2 className="section-title">Security Settings</h2>
                            <p className="section-description">Manage your account security and password</p>

                            <div className="form-group">
                                <label>Current Password</label>
                                <input type="password" placeholder="Enter current password" />
                            </div>

                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" placeholder="Enter new password" />
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" placeholder="Confirm new password" />
                            </div>

                            <button className="btn btn-outline">Change Password</button>

                            <div className="security-info">
                                <h4>Two-Factor Authentication</h4>
                                <p>Add an extra layer of security to your account</p>
                                <button className="btn btn-secondary">Enable 2FA</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="settings-section">
                            <h2 className="section-title">Appearance</h2>
                            <p className="section-description">Customize how the app looks and feels</p>

                            <div className="settings-group">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <Moon size={20} />
                                        <div>
                                            <h4>Dark Mode</h4>
                                            <p>Enable dark theme</p>
                                        </div>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={settings.darkMode}
                                            onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Language</label>
                                <select
                                    value={settings.language}
                                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                >
                                    <option value="en">English</option>
                                    <option value="id">Bahasa Indonesia</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Timezone</label>
                                <select
                                    value={settings.timezone}
                                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                >
                                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                                    <option value="UTC+0">GMT (UTC+0)</option>
                                    <option value="UTC+7">WIB (UTC+7)</option>
                                    <option value="UTC+8">WITA (UTC+8)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="settings-section">
                            <h2 className="section-title">Privacy Settings</h2>
                            <p className="section-description">Control your privacy and data sharing preferences</p>

                            <div className="form-group">
                                <label>Profile Visibility</label>
                                <select
                                    value={settings.profileVisibility}
                                    onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                                >
                                    <option value="public">Public</option>
                                    <option value="school">School Only</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>

                            <div className="settings-group">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <Mail size={20} />
                                        <div>
                                            <h4>Show Email</h4>
                                            <p>Display your email on your profile</p>
                                        </div>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={settings.showEmail}
                                            onChange={(e) => setSettings({ ...settings, showEmail: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <Bell size={20} />
                                        <div>
                                            <h4>Show Phone</h4>
                                            <p>Display your phone number on your profile</p>
                                        </div>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={settings.showPhone}
                                            onChange={(e) => setSettings({ ...settings, showPhone: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SettingsPage
