import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react'
import { useTenant } from '../../../contexts/TenantContext'
import { getTeachers, deleteTeacher, getMajorList, TeacherFilters } from '../../../services/teacherService'
import { Teacher } from '../../../types'
import '../../../styles/teachers.scss'

const TeachersList: React.FC = () => {
    const navigate = useNavigate()
    const { tenant } = useTenant()

    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const limit = 20

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [majorList, setMajorList] = useState<string[]>([])
    const [filters, setFilters] = useState<TeacherFilters>({})
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        if (tenant?.id) {
            loadTeachers()
            loadFilterOptions()
        }
    }, [tenant, currentPage, filters])

    const loadTeachers = async () => {
        if (!tenant) return

        setLoading(true)
        setError(null)

        try {
            const response = await getTeachers(tenant.id, filters, { page: currentPage, limit })
            setTeachers(response.teachers)
            setTotal(response.total)
            setTotalPages(response.totalPages)
        } catch (err: any) {
            setError(err.message || 'Failed to load teachers')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadFilterOptions = async () => {
        if (!tenant) return

        try {
            const majors = await getMajorList(tenant.id)
            setMajorList(majors)
        } catch (err) {
            console.error('Failed to load filter options:', err)
        }
    }

    const handleSearch = () => {
        setFilters({ ...filters, search: searchTerm })
        setCurrentPage(1)
    }

    const handleFilterChange = (key: keyof TeacherFilters, value: any) => {
        setFilters({ ...filters, [key]: value || undefined })
        setCurrentPage(1)
    }

    const handleClearFilters = () => {
        setFilters({})
        setSearchTerm('')
        setCurrentPage(1)
    }

    const handleDeleteTeacher = async (teacher: Teacher) => {
        if (!window.confirm(`Are you sure you want to delete ${teacher.full_name}?`)) {
            return
        }

        try {
            await deleteTeacher(teacher.id)
            loadTeachers()
        } catch (err: any) {
            alert(err.message || 'Failed to delete teacher')
        }
    }

    const getStatusBadgeClass = (status: Teacher['status']) => {
        switch (status) {
            case 'active': return 'status-badge status-active'
            case 'inactive': return 'status-badge status-inactive'
            case 'on_leave': return 'status-badge status-on_leave'
            case 'resigned': return 'status-badge status-resigned'
            default: return 'status-badge'
        }
    }

    if (loading && teachers.length === 0) {
        return (
            <div className="teachers-page">
                <div className="loading-state">Loading teachers...</div>
            </div>
        )
    }

    return (
        <div className="teachers-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1>Teachers Management</h1>
                    <p className="subtitle">Manage teacher data and staff information</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => navigate('/admin/teachers/add')}>
                        <Plus size={20} />
                        Add Teacher
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="filters-section">
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or NIP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn-search" onClick={handleSearch}>Search</button>
                </div>

                <button className="btn-filter" onClick={() => setShowFilters(!showFilters)}>
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {showFilters && (
                <div className="filter-panel">
                    <div className="filter-grid">
                        <div className="filter-item">
                            <label>Employment Status</label>
                            <select
                                value={filters.employment_status || ''}
                                onChange={(e) => handleFilterChange('employment_status', e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="permanent">Permanent</option>
                                <option value="contract">Contract</option>
                                <option value="part_time">Part Time</option>
                                <option value="honorary">Honorary</option>
                            </select>
                        </div>

                        <div className="filter-item">
                            <label>Status</label>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value as Teacher['status'])}
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="on_leave">On Leave</option>
                                <option value="resigned">Resigned</option>
                            </select>
                        </div>

                        <div className="filter-item">
                            <label>Major/Specialization</label>
                            <select
                                value={filters.major || ''}
                                onChange={(e) => handleFilterChange('major', e.target.value)}
                            >
                                <option value="">All Majors</option>
                                {majorList.map(major => (
                                    <option key={major} value={major}>{major}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-item filter-actions">
                            <button className="btn btn-secondary" onClick={handleClearFilters}>
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-label">Total Teachers:</span>
                    <span className="stat-value">{total}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Showing:</span>
                    <span className="stat-value">{teachers.length}</span>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={loadTeachers}>Retry</button>
                </div>
            )}

            {/* Table */}
            <div className="table-container">
                <table className="teachers-table">
                    <thead>
                        <tr>
                            <th>NIP</th>
                            <th>Name</th>
                            <th>Major</th>
                            <th>Gender</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="empty-state">
                                    No teachers found. Click "Add Teacher" to create one.
                                </td>
                            </tr>
                        ) : (
                            teachers.map(teacher => (
                                <tr key={teacher.id}>
                                    <td className="nip-cell">{teacher.nip}</td>
                                    <td className="name-cell">
                                        <div className="teacher-name">
                                            {teacher.photo_url && (
                                                <img src={teacher.photo_url} alt={teacher.full_name} className="teacher-avatar" />
                                            )}
                                            <div>
                                                <div className="full-name">
                                                    {teacher.title ? `${teacher.title} ` : ''}{teacher.full_name}
                                                </div>
                                                {teacher.nickname && <div className="nickname">({teacher.nickname})</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{teacher.major || '-'}</td>
                                    <td>{teacher.gender === 'male' ? 'M' : teacher.gender === 'female' ? 'F' : '-'}</td>
                                    <td>{teacher.phone || '-'}</td>
                                    <td>
                                        <span className={getStatusBadgeClass(teacher.status)}>
                                            {teacher.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-sm capitalize text-gray-600">
                                            {teacher.employment_status?.replace('_', ' ') || '-'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon"
                                            onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => navigate(`/admin/teachers/${teacher.id}/edit`)}
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => handleDeleteTeacher(teacher)}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn-page"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </button>

                    <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`btn-page ${page === currentPage ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        className="btn-page"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default TeachersList
