// User Types
export interface User {
  id: string
  email: string
  phone?: string
  address?: string
  is_profile_completed?: boolean
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    phone?: string
    address?: string
    is_profile_completed?: boolean
    role?: 'super_admin' | 'parent' | 'admin' | 'teacher' | 'student'
  }
  role?: 'super_admin' | 'parent' | 'admin' | 'teacher' | 'student'
}

export interface ParentProfile {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

// Tenant Types
export interface Tenant {
  id: string
  name: string
  subdomain: string
  theme_config: ThemeConfig
  active_modules: string[]
}

export interface ThemeConfig {
  primaryColor?: string
  primary_color?: string // Database compatibility
  secondaryColor?: string
  secondary_color?: string // Database compatibility
  logo?: string
  fontFamily?: string
}

// Payment Types
export interface PaymentSubmission {
  id?: string
  tenant_id: string
  parent_id: string
  student_id: string
  payment_type: 'spp' | 'uang_gedung' | 'uang_kegiatan' | 'lainnya'
  amount: number
  payment_date: string
  description?: string
  proof_image_url: string
  ai_extracted_data?: AIExtractedData
  status: 'pending' | 'verified' | 'rejected'
  created_at: string
}

export interface AIExtractedData {
  amount: { value: number; confidence: number }
  transfer_date: { value: string; confidence: number }
  destination_account: { value: string; confidence: number }
  sender_name?: { value: string; confidence: number }
  overall_confidence: number
}

// Student Types
export interface Student {
  id: string
  tenant_id: string

  // Personal Information
  nis: string
  nisn?: string
  full_name: string
  nickname?: string
  gender?: 'male' | 'female'
  birth_place?: string
  birth_date?: string
  religion?: string

  // Contact Information
  phone?: string
  email?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string

  // Academic Information
  class?: string
  major?: string
  academic_year?: string
  admission_date?: string
  graduation_date?: string

  // Parent/Guardian Information
  father_name?: string
  father_phone?: string
  father_occupation?: string
  mother_name?: string
  mother_phone?: string
  mother_occupation?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_relation?: string

  // Status
  status: 'active' | 'inactive' | 'graduated' | 'transferred' | 'dropped'

  // Additional
  photo_url?: string
  notes?: string

  // Metadata
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

export interface StudentFormData {
  nis: string
  nisn?: string
  full_name: string
  nickname?: string
  gender?: 'male' | 'female'
  birth_place?: string
  birth_date?: string
  religion?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  class?: string
  major?: string
  academic_year?: string
  admission_date?: string
  father_name?: string
  father_phone?: string
  father_occupation?: string
  mother_name?: string
  mother_phone?: string
  mother_occupation?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_relation?: string
  status: 'active' | 'inactive' | 'graduated' | 'transferred' | 'dropped'
  notes?: string
}


export interface ParentStudentBinding {
  id: string
  parent_id: string
  student_id: string
  relationship: 'ayah' | 'ibu' | 'wali'
  is_verified: boolean
  verified_by?: string
  verified_at?: string
}

// Meeting Types
export interface Meeting {
  id: string
  title: string
  agenda: string
  scheduled_time: string
  duration: number
  location: string
  organizer_id: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  ai_analysis?: MeetingAIAnalysis
  minutes_content?: MeetingMinutes
  published_at?: string
}

export interface MeetingAIAnalysis {
  transcription: string
  action_items: ActionItem[]
  decisions: string[]
  topics: string[]
  overall_confidence: number
}

export interface ActionItem {
  task: string
  owner: string
  deadline: string
}

export interface MeetingMinutes {
  executive_summary: string
  decisions_made: string[]
  action_items: ActionItem[]
  discussion_points: string[]
  next_steps: string[]
}

// Context Types
export interface AuthContextType {
  user: User | null
  loading: boolean
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

export interface TenantContextType {
  tenant: Tenant | null
  loading: boolean
  setTenant: (tenant: Tenant) => void
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface CloudinaryUploadResult {
  asset_id: string
  public_id: string
  version: number
  version_id: string
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  bytes: number
  type: string
  etag: string
  placeholder: boolean
  url: string
  secure_url: string
  folder: string
  original_filename: string
  api_key: string
}

// Super Admin specific types
export interface SuperAdmin {
  id: string
  email: string
  name: string
  permissions: string[]
  created_at: string
}

export interface PlatformStats {
  total_tenants: number
  total_students: number
  total_payments: number
  active_modules: string[]
}