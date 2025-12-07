import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useTenant } from '../../../contexts/TenantContext'
import { useAuth } from '../../../contexts/AuthContext'
import { createTeacher, updateTeacher, getTeacherById } from '../../../services/teacherService'
import { TeacherFormData } from '../../../types'
import '../../../styles/teachers.scss'

const TeacherForm: React.FC = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { tenant } = useTenant()
    const { user } = useAuth()
    const isEditMode = Boolean(id)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [subjectsString, setSubjectsString] = useState('')
    const [formData, setFormData] = useState<TeacherFormData>({
        nip: '',
        full_name: '',
        status: 'active',
        gender: 'male' // default
    })

    useEffect(() => {
        if (isEditMode && id) {
            loadTeacher(id)
        }
    }, [id])

    const loadTeacher = async (teacherId: string) => {
        try {
            const teacher = await getTeacherById(teacherId)
            if (teacher) {
                // @ts-ignore - Supabase returns partial match to interface
                setFormData(teacher)
                if (teacher.subjects) {
                    setSubjectsString(teacher.subjects.join(', '))
                }
            }
        } catch (err: any) {
            setError(err.message)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!tenant) {
            setError('No tenant found')
            return
        }

        setLoading(true)
        setError(null)

        // Process subjects
        const subjects = subjectsString.split(',').map(s => s.trim()).filter(Boolean)
        const dataToSubmit = { ...formData, subjects }

        try {
            if (isEditMode && id) {
                await updateTeacher(id, dataToSubmit, user?.id)
            } else {
                await createTeacher(tenant.id, dataToSubmit, user?.id)
            }
            navigate('/admin/teachers')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="teacher-form-page">
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate('/admin/teachers')}>
                    <ArrowLeft size={20} />
                    Back to Teachers
                </button>
                <h1>{isEditMode ? 'Edit Teacher' : 'Add New Teacher'}</h1>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="teacher-form">
                {/* Professional Information */}
                <div className="form-section">
                    <h2>Professional Information</h2>
                    <div className="form-grid">
                        <div className="form-group required">
                            <label>NIP (Employee ID) *</label>
                            <input
                                type="text"
                                name="nip"
                                value={formData.nip}
                                onChange={handleChange}
                                required
                                maxLength={50}
                                placeholder="e.g. 19800101..."
                            />
                        </div>

                        <div className="form-group required">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                maxLength={255}
                            />
                        </div>

                        <div className="form-group">
                            <label>Title (Gelar)</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                placeholder="e.g. S.Pd., M.Pd."
                                maxLength={50}
                            />
                        </div>

                        <div className="form-group">
                            <label>Nickname</label>
                            <input
                                type="text"
                                name="nickname"
                                value={formData.nickname || ''}
                                onChange={handleChange}
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label>Employment Status</label>
                            <select name="employment_status" value={formData.employment_status || ''} onChange={handleChange}>
                                <option value="">Select Status</option>
                                <option value="permanent">Permanent (PNS/Tetap)</option>
                                <option value="contract">Contract (Honorer)</option>
                                <option value="part_time">Part Time</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Join Date</label>
                            <input
                                type="date"
                                name="join_date"
                                value={formData.join_date || ''}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Qualification</label>
                            <input
                                type="text"
                                name="qualification"
                                value={formData.qualification || ''}
                                onChange={handleChange}
                                placeholder="e.g. S1, S2, Diploma"
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label>Major</label>
                            <input
                                type="text"
                                name="major"
                                value={formData.major || ''}
                                onChange={handleChange}
                                placeholder="e.g. Mathematics Education"
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label>University</label>
                            <input
                                type="text"
                                name="university"
                                value={formData.university || ''}
                                onChange={handleChange}
                                maxLength={255}
                            />
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="form-section">
                    <h2>Personal Information</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Gender</label>
                            <select name="gender" value={formData.gender || ''} onChange={handleChange}>
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Birth Place</label>
                            <input
                                type="text"
                                name="birth_place"
                                value={formData.birth_place || ''}
                                onChange={handleChange}
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label>Birth Date</label>
                            <input
                                type="date"
                                name="birth_date"
                                value={formData.birth_date || ''}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Religion</label>
                            <select name="religion" value={formData.religion || ''} onChange={handleChange}>
                                <option value="">Select Religion</option>
                                <option value="Islam">Islam</option>
                                <option value="Kristen">Kristen</option>
                                <option value="Katolik">Katolik</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Buddha">Buddha</option>
                                <option value="Konghucu">Konghucu</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="form-section">
                    <h2>Contact Information</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                maxLength={50}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                maxLength={255}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Address</label>
                            <textarea
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city || ''}
                                onChange={handleChange}
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label>Province</label>
                            <input
                                type="text"
                                name="province"
                                value={formData.province || ''}
                                onChange={handleChange}
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label>Postal Code</label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code || ''}
                                onChange={handleChange}
                                maxLength={20}
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="form-section">
                    <h2>Additional Information</h2>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Subjects Taught (comma separated)</label>
                            <input
                                type="text"
                                value={subjectsString}
                                onChange={(e) => setSubjectsString(e.target.value)}
                                placeholder="e.g. Mathematics, Physics, Chemistry"
                            />
                        </div>

                        <div className="form-group required">
                            <label>Status *</label>
                            <select name="status" value={formData.status} onChange={handleChange} required>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="on_leave">On Leave</option>
                                <option value="resigned">Resigned</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Any additional notes..."
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/teachers')}>
                        <X size={20} />
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={20} />
                        {loading ? 'Saving...' : isEditMode ? 'Update Teacher' : 'Create Teacher'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default TeacherForm
