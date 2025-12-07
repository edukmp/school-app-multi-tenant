/**
 * Teacher Service
 * CRUD operations for teacher management with multi-tenant support
 */

import { supabase } from './supabase'
import { Teacher, TeacherFormData } from '../types'
import { PaginationParams } from './studentService'

const TEACHERS_TABLE = 'teachers'

export interface TeacherFilters {
    search?: string
    employment_status?: Teacher['employment_status']
    status?: Teacher['status']
    major?: string
}

export interface TeachersResponse {
    teachers: Teacher[]
    total: number
    page: number
    limit: number
    totalPages: number
}

/**
 * Get all teachers for a tenant with optional filters and pagination
 */
export async function getTeachers(
    tenantId: string,
    filters?: TeacherFilters,
    pagination?: PaginationParams
): Promise<TeachersResponse> {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const offset = (page - 1) * limit

    let query = supabase
        .from(TEACHERS_TABLE)
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)

    // Apply filters
    if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,nip.ilike.%${filters.search}%`)
    }

    if (filters?.employment_status) {
        query = query.eq('employment_status', filters.employment_status)
    }

    if (filters?.status) {
        query = query.eq('status', filters.status)
    }

    if (filters?.major) {
        query = query.ilike('major', `%${filters.major}%`)
    }

    // Apply sorting and pagination
    const { data, error, count } = await query
        .order('full_name', { ascending: true })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Error fetching teachers:', error)
        throw new Error(error.message)
    }

    const totalPages = count ? Math.ceil(count / limit) : 0

    return {
        teachers: (data as Teacher[]) || [],
        total: count || 0,
        page,
        limit,
        totalPages
    }
}

/**
 * Get a single teacher by ID
 */
export async function getTeacherById(id: string): Promise<Teacher | null> {
    const { data, error } = await supabase
        .from(TEACHERS_TABLE)
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching teacher:', error)
        throw new Error(error.message)
    }

    return data as Teacher
}

/**
 * Create a new teacher
 */
export async function createTeacher(
    tenantId: string,
    teacherData: TeacherFormData,
    userId?: string
): Promise<Teacher> {
    const { data, error } = await supabase
        .from(TEACHERS_TABLE)
        .insert([
            {
                tenant_id: tenantId,
                ...teacherData,
                created_by: userId,
                updated_by: userId
            }
        ])
        .select()
        .single()

    if (error) {
        console.error('Error creating teacher:', error)

        // Check for unique constraint violation
        if (error.code === '23505') {
            throw new Error('NIP already exists for this school')
        }

        throw new Error(error.message)
    }

    return data as Teacher
}

/**
 * Update an existing teacher
 */
export async function updateTeacher(
    id: string,
    teacherData: Partial<TeacherFormData>,
    userId?: string
): Promise<Teacher> {
    const { data, error } = await supabase
        .from(TEACHERS_TABLE)
        .update({
            ...teacherData,
            updated_by: userId
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating teacher:', error)

        // Check for unique constraint violation
        if (error.code === '23505') {
            throw new Error('NIP already exists for this school')
        }

        throw new Error(error.message)
    }

    return data as Teacher
}

/**
 * Delete a teacher
 */
export async function deleteTeacher(id: string): Promise<void> {
    const { error } = await supabase
        .from(TEACHERS_TABLE)
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting teacher:', error)
        throw new Error(error.message)
    }
}

/**
 * Get unique majors list for filters
 */
export async function getMajorList(tenantId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from(TEACHERS_TABLE)
        .select('major')
        .eq('tenant_id', tenantId)
        .not('major', 'is', null)

    if (error) {
        console.error('Error fetching major list:', error)
        return []
    }

    // Get unique values
    const uniqueMajors = [...new Set((data as any[]).map(item => item.major).filter(Boolean))]
    return uniqueMajors.sort()
}

/**
 * Get statistics for dashboard
 */
export async function getTeacherStats(tenantId: string) {
    const { data, error } = await supabase
        .from(TEACHERS_TABLE)
        .select('status, employment_status')
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error fetching teacher stats:', error)
        return {
            total: 0,
            active: 0,
            inactive: 0,
            fullTime: 0
        }
    }

    const stats = {
        total: data.length,
        active: data.filter(s => s.status === 'active').length,
        inactive: data.filter(s => s.status === 'inactive').length,
        fullTime: data.filter(s => s.employment_status === 'permanent' || s.employment_status === 'full_time').length // using permanent/contract as full time roughly
    }

    return stats
}

/**
 * Upload teacher photo
 */
export async function uploadTeacherPhoto(
    file: File,
    tenantId: string,
    teacherId: string
): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${tenantId}/${teacherId}.${fileExt}`
    const filePath = `teacher-photos/${fileName}`

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
