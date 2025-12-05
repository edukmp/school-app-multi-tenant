/**
 * Student Service
 * CRUD operations for student management with multi-tenant support
 */

import { supabase } from './supabase'
import { Student, StudentFormData } from '../types'

const STUDENTS_TABLE = 'students'

export interface StudentFilters {
    search?: string
    class?: string
    status?: Student['status']
    academic_year?: string
}

export interface PaginationParams {
    page?: number
    limit?: number
}

export interface StudentsResponse {
    students: Student[]
    total: number
    page: number
    limit: number
    totalPages: number
}

/**
 * Get all students for a tenant with optional filters and pagination
 */
export async function getStudents(
    tenantId: string,
    filters?: StudentFilters,
    pagination?: PaginationParams
): Promise<StudentsResponse> {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const offset = (page - 1) * limit

    let query = supabase
        .from(STUDENTS_TABLE)
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)

    // Apply filters
    if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,nis.ilike.%${filters.search}%`)
    }

    if (filters?.class) {
        query = query.eq('class', filters.class)
    }

    if (filters?.status) {
        query = query.eq('status', filters.status)
    }

    if (filters?.academic_year) {
        query = query.eq('academic_year', filters.academic_year)
    }

    // Apply sorting and pagination
    const { data, error, count } = await query
        .order('full_name', { ascending: true })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Error fetching students:', error)
        throw new Error(error.message)
    }

    const totalPages = count ? Math.ceil(count / limit) : 0

    return {
        students: data || [],
        total: count || 0,
        page,
        limit,
        totalPages
    }
}

/**
 * Get a single student by ID
 */
export async function getStudentById(id: string): Promise<Student | null> {
    const { data, error } = await supabase
        .from(STUDENTS_TABLE)
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching student:', error)
        throw new Error(error.message)
    }

    return data
}

/**
 * Create a new student
 */
export async function createStudent(
    tenantId: string,
    studentData: StudentFormData,
    userId?: string
): Promise<Student> {
    const { data, error } = await supabase
        .from(STUDENTS_TABLE)
        .insert([
            {
                tenant_id: tenantId,
                ...studentData,
                created_by: userId,
                updated_by: userId
            }
        ])
        .select()
        .single()

    if (error) {
        console.error('Error creating student:', error)

        // Check for unique constraint violation
        if (error.code === '23505') {
            throw new Error('NIS already exists for this school')
        }

        throw new Error(error.message)
    }

    return data
}

/**
 * Update an existing student
 */
export async function updateStudent(
    id: string,
    studentData: Partial<StudentFormData>,
    userId?: string
): Promise<Student> {
    const { data, error } = await supabase
        .from(STUDENTS_TABLE)
        .update({
            ...studentData,
            updated_by: userId
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating student:', error)

        // Check for unique constraint violation
        if (error.code === '23505') {
            throw new Error('NIS already exists for this school')
        }

        throw new Error(error.message)
    }

    return data
}

/**
 * Delete a student
 */
export async function deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
        .from(STUDENTS_TABLE)
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting student:', error)
        throw new Error(error.message)
    }
}

/**
 * Get unique class list for filters
 */
export async function getClassList(tenantId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from(STUDENTS_TABLE)
        .select('class')
        .eq('tenant_id', tenantId)
        .not('class', 'is', null)

    if (error) {
        console.error('Error fetching class list:', error)
        return []
    }

    // Get unique values
    const uniqueClasses = [...new Set(data.map(item => item.class).filter(Boolean))]
    return uniqueClasses.sort()
}

/**
 * Get unique academic years for filters
 */
export async function getAcademicYears(tenantId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from(STUDENTS_TABLE)
        .select('academic_year')
        .eq('tenant_id', tenantId)
        .not('academic_year', 'is', null)

    if (error) {
        console.error('Error fetching academic years:', error)
        return []
    }

    // Get unique values
    const uniqueYears = [...new Set(data.map(item => item.academic_year).filter(Boolean))]
    return uniqueYears.sort().reverse() // Most recent first
}

/**
 * Get statistics for dashboard
 */
export async function getStudentStats(tenantId: string) {
    const { data, error } = await supabase
        .from(STUDENTS_TABLE)
        .select('status')
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error fetching student stats:', error)
        return {
            total: 0,
            active: 0,
            inactive: 0,
            graduated: 0
        }
    }

    const stats = {
        total: data.length,
        active: data.filter(s => s.status === 'active').length,
        inactive: data.filter(s => s.status === 'inactive').length,
        graduated: data.filter(s => s.status === 'graduated').length
    }

    return stats
}

/**
 * Upload student photo
 */
export async function uploadStudentPhoto(
    file: File,
    tenantId: string,
    studentId: string
): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${tenantId}/${studentId}.${fileExt}`
    const filePath = `student-photos/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { upsert: true })

    if (uploadError) {
        console.error('Error uploading photo:', uploadError)
        throw new Error(uploadError.message)
    }

    const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

    return data.publicUrl
}
