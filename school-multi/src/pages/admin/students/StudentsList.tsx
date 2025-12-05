import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Edit, Trash2, Eye, Filter, Download } from 'lucide-react'
import { useTenant } from '../../../contexts/TenantContext'
import { useAuth } from '../../../contexts/AuthContext'
import { getStudents, deleteStudent, getClassList, getAcademicYears, StudentFilters } from '../../../services/studentService'
import { Student } from '../../../types'
import '../../../styles/students.scss'

const StudentsList: React.FC = () => {
    const navigate = useNavigate()
    const { tenant } = useTenant()
    const { user } = useAuth()

    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const limit = 20

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [classList, setClassList] = useState<string[]>([])
    const [academicYears, setAcademicYears] = useState<string[]>([])
    const [filters, setFilters] = useState<StudentFilters>({})
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        if (tenant?.id) {
            loadStudents()
            loadFilterOptions()
        }
    }, [tenant, currentPage, filters])

    const loadStudents = async () => {
        if (!tenant) return

        setLoading(true)
        setError(null)

        try {
            const response = await getStudents(tenant.id, filters, { page: currentPage, limit })
            setStudents(response.students)
            setTotal(response.total)
            setTotalPages(response.totalPages)
        } catch (err: any) {
            setError(err.message || 'Failed to load students')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadFilterOptions = async () => {
        if (!tenant) return

        try {
            const [classes, years] = await Promise.all([
                getClassList(tenant.id),
                getAcademicYears(tenant.id)
            ])
            setClassList(classes)
            setAcademicYears(years)
        } catch (err) {
            console.error('Failed to load filter options:', err)
        }
    }

    const handleSearch = () => {
        setFilters({ ...filters, search: searchTerm })
        setCurrentPage(1)
    }

    const handleFilterChange = (key: keyof StudentFilters, value: any) => {
        setFilters({ ...filters, [key]: value || undefined })
        setCurrentPage(1)
    }

    const handleClearFilters = () => {
        setFilters({})
        setSearchTerm('')
        setCurrentPage(1)
    }

    const handleDeleteStudent = async (student: Student) => {
        if (!window.confirm(`Are you sure you want to delete ${student.full_name}?`)) {
            return
        }

        try {
            await deleteStudent(student.id)
            loadStudents()
        } catch (err: any) {
            alert(err.message || 'Failed to delete student')
        }
    }

    const getStatusBadgeClass = (status: Student['status']) => {
        switch (status) {
            case 'active': return 'status-badge status-active'
            case 'inactive': return 'status-badge status-inactive'
            case 'graduated': return 'status-badge status-graduated'
            case 'transferred': return 'status-badge status-transferred'
            case 'dropped': return 'status-badge status-dropped'
            default: return 'status-badge'
        }
    }

    if (loading && students.length === 0) {
        return (
            <div className="students-page">
                <div className="loading-state">Loading students...</div>
            </div>
        )
    }

    return (
        <div className="students-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1>Students Management</h1>
                    <p className="subtitle">Manage student data and information</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => navigate('/admin/students/add')}>
                        <Plus size={20} />
                        Add Student
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="filters-section">
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or NIS..."
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
                            <label>Class</label>
                            <select
                                value={filters.class || ''}
                                onChange={(e) => handleFilterChange('class', e.target.value)}
                            >
                                <option value="">All Classes</option>
                                {classList.map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-item">
                            <label>Status</label>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value as Student['status'])}
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="graduated">Graduated</option>
                                <option value="transferred">Transferred</option>
                                <option value="dropped">Dropped</option>
                            </select>
                        </div>

                        <div className="filter-item">
                            <label>Academic Year</label>
                            <select
                                value={filters.academic_year || ''}
                                onChange={(e) => handleFilterChange('academic_year', e.target.value)}
                            >
                                <option value="">All Years</option>
                                {academicYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
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
                    <span className="stat-label">Total Students:</span>
                    <span className="stat-value">{total}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Showing:</span>
                    <span className="stat-value">{students.length}</span>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={loadStudents}>Retry</button>
                </div>
            )}

            {/* Table */}
            <div className="table-container">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>NIS</th>
                            <th>Name</th>
                            <th>Class</th>
                            <th>Gender</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="empty-state">
                                    No students found. Click "Add Student" to create one.
                                </td>
                            </tr>
                        ) : (
                            students.map(student => (
                                <tr key={student.id}>
                                    <td className="nis-cell">{student.nis}</td>
                                    <td className="name-cell">
                                        <div className="student-name">
                                            {student.photo_url && (
                                                <img src={student.photo_url} alt={student.full_name} className="student-avatar" />
                                            )}
                                            <div>
                                                <div className="full-name">{student.full_name}</div>
                                                {student.nickname && <div className="nickname">({student.nickname})</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{student.class || '-'}</td>
                                    <td>{student.gender === 'male' ? 'M' : student.gender === 'female' ? 'F' : '-'}</td>
                                    <td>{student.phone || '-'}</td>
                                    <td>
                                        <span className={getStatusBadgeClass(student.status)}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon"
                                            onClick={() => navigate(`/admin/students/${student.id}`)}
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => navigate(`/admin/students/${student.id}/edit`)}
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => handleDeleteStudent(student)}
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

export default StudentsList
