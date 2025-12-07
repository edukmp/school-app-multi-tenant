import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, BookOpen, Building, User, GraduationCap, Flag, Camera } from 'lucide-react'
import { getTeacherById, uploadTeacherPhoto, updateTeacher } from '../../../services/teacherService'
import { useAuth } from '../../../contexts/AuthContext'
import { useTenant } from '../../../contexts/TenantContext'
import { Teacher } from '../../../types'
import '../../../styles/teachers.scss'

const TeacherDetail: React.FC = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { tenant } = useTenant()

    const [teacher, setTeacher] = useState<Teacher | null>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (id) {
            loadTeacher(id)
        }
    }, [id])

    const loadTeacher = async (teacherId: string) => {
        setLoading(true)
        try {
            const data = await getTeacherById(teacherId)
            setTeacher(data)
        } catch (err: any) {
            setError(err.message || 'Failed to load teacher details')
        } finally {
            setLoading(false)
        }
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !teacher || !tenant) return

        const file = e.target.files[0]
        // Validate file size (e.g., max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File size too large. Please upload an image smaller than 2MB.')
            return
        }

        setUploading(true)
        try {
            const photoUrl = await uploadTeacherPhoto(file, tenant.id, teacher.id)

            // Update teacher record with new photo URL
            await updateTeacher(teacher.id, { photo_url: photoUrl }, user?.id)

            // Update local state
            setTeacher(prev => prev ? { ...prev, photo_url: photoUrl } : null)
        } catch (err: any) {
            alert('Failed to upload photo: ' + err.message)
        } finally {
            setUploading(false)
        }
    }

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active': return 'badge status-active'
            case 'inactive': return 'badge status-inactive'
            case 'on_leave': return 'badge status-on_leave'
            case 'resigned': return 'badge status-resigned'
            default: return 'badge'
        }
    }

    if (loading) {
        return (
            <div className="teacher-detail-page">
                <div className="loading-state">Loading teacher details...</div>
            </div>
        )
    }

    if (error || !teacher) {
        return (
            <div className="teacher-detail-page">
                <div className="error-message">
                    <p>{error || 'Teacher not found'}</p>
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/teachers')}>
                        Back to List
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="teacher-detail-page">
            {/* Header / Nav */}
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate('/admin/teachers')}>
                    <ArrowLeft size={18} />
                    Back to Teachers
                </button>
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/admin/teachers/${teacher.id}/edit`)}
                    >
                        <Edit size={18} />
                        Edit Teacher
                    </button>
                </div>
            </div>

            {/* Profile Card Main */}
            <div className="profile-card">
                <div className="profile-header">
                    <label className={`profile-photo-wrapper ${uploading ? 'uploading' : ''}`}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />
                        {teacher.photo_url ? (
                            <img src={teacher.photo_url} alt={teacher.full_name} className="profile-photo" />
                        ) : (
                            <div className="profile-photo-placeholder">
                                <User size={48} />
                            </div>
                        )}
                        <div className="photo-edit-overlay">
                            <Camera size={24} />
                            <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
                        </div>
                    </label>
                    <div className="profile-info">
                        <h1>
                            {teacher.title ? `${teacher.title} ` : ''}
                            {teacher.full_name}
                        </h1>
                        {teacher.nickname && <div className="nickname">"{teacher.nickname}"</div>}

                        <div className="profile-badges">
                            <span className={getStatusBadgeClass(teacher.status)}>
                                {teacher.status?.replace('_', ' ')}
                            </span>
                            <span className="badge">
                                {teacher.employment_status?.replace('_', ' ')}
                            </span>
                            <span className="badge">
                                NIP: {teacher.nip}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="details-grid">
                {/* Professional Info */}
                <div className="detail-section">
                    <h2>Professional Information</h2>
                    <div className="detail-items">
                        <div className="detail-item">
                            <label><BookOpen size={14} /> Major</label>
                            <span>{teacher.major || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <label><GraduationCap size={14} /> Qualification</label>
                            <span>{teacher.qualification || '-'}</span>
                        </div>
                        <div className="detail-item full-width">
                            <label><Building size={14} /> University</label>
                            <span>{teacher.university || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <label><Calendar size={14} /> Join Date</label>
                            <span>{teacher.join_date ? new Date(teacher.join_date).toLocaleDateString() : '-'}</span>
                        </div>
                        <div className="detail-item full-width">
                            <label><BookOpen size={14} /> Subjects Taught</label>
                            <span>
                                {teacher.subjects && teacher.subjects.length > 0
                                    ? teacher.subjects.join(', ')
                                    : 'No subjects listed'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="detail-section">
                    <h2>Contact & Personal</h2>
                    <div className="detail-items">
                        <div className="detail-item">
                            <label><Phone size={14} /> Phone</label>
                            <span>{teacher.phone || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <label><Mail size={14} /> Email</label>
                            <span>{teacher.email || '-'}</span>
                        </div>
                        <div className="detail-item full-width">
                            <label><MapPin size={14} /> Address</label>
                            <span>
                                {teacher.address}
                                {teacher.city && `, ${teacher.city}`}
                                {teacher.province && `, ${teacher.province}`}
                                {teacher.postal_code && ` ${teacher.postal_code}`}
                            </span>
                        </div>
                        <div className="detail-item">
                            <label><User size={14} /> Gender</label>
                            <span style={{ textTransform: 'capitalize' }}>{teacher.gender || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <label><Flag size={14} /> Birth Place/Date</label>
                            <span>
                                {teacher.birth_place || '-'}, {teacher.birth_date ? new Date(teacher.birth_date).toLocaleDateString() : '-'}
                            </span>
                        </div>
                        <div className="detail-item">
                            <label>RELIGION</label>
                            <span>{teacher.religion || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {(teacher.notes) && (
                    <div className="detail-section full-width">
                        <h2>Additional Notes</h2>
                        <div className="notes-content">
                            {teacher.notes}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeacherDetail
