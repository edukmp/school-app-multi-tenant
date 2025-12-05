-- Students Table Setup
-- This table stores student information for each tenant

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Personal Information
    nis VARCHAR(50) NOT NULL, -- Nomor Induk Siswa
    nisn VARCHAR(50), -- Nomor Induk Siswa Nasional
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    gender VARCHAR(20) CHECK (gender IN ('male', 'female')),
    birth_place VARCHAR(100),
    birth_date DATE,
    religion VARCHAR(50),
    
    -- Contact Information
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Academic Information
    class VARCHAR(50), -- e.g., "10 IPA 1", "7A"
    major VARCHAR(100), -- e.g., "IPA", "IPS", "Bahasa"
    academic_year VARCHAR(20), -- e.g., "2024/2025"
    admission_date DATE,
    graduation_date DATE,
    
    -- Parent/Guardian Information
    father_name VARCHAR(255),
    father_phone VARCHAR(50),
    father_occupation VARCHAR(100),
    mother_name VARCHAR(255),
    mother_phone VARCHAR(50),
    mother_occupation VARCHAR(100),
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(50),
    guardian_relation VARCHAR(50),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred', 'dropped')),
    
    -- Additional Information
    photo_url TEXT,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    UNIQUE(tenant_id, nis) -- NIS must be unique within a tenant
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_tenant_id ON students(tenant_id);
CREATE INDEX IF NOT EXISTS idx_students_nis ON students(tenant_id, nis);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(tenant_id, class);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(tenant_id, full_name);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table

-- Allow users to view students from their own tenant
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'students' 
        AND policyname = 'Users can view students from their tenant'
    ) THEN
        CREATE POLICY "Users can view students from their tenant"
        ON students FOR SELECT
        TO authenticated
        USING (
            tenant_id IN (
                SELECT tenant_id FROM profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END
$$;

-- Allow admins to insert students
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'students' 
        AND policyname = 'Admins can insert students'
    ) THEN
        CREATE POLICY "Admins can insert students"
        ON students FOR INSERT
        TO authenticated
        WITH CHECK (
            tenant_id IN (
                SELECT tenant_id FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'super_admin')
            )
        );
    END IF;
END
$$;

-- Allow admins to update students
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'students' 
        AND policyname = 'Admins can update students'
    ) THEN
        CREATE POLICY "Admins can update students"
        ON students FOR UPDATE
        TO authenticated
        USING (
            tenant_id IN (
                SELECT tenant_id FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'super_admin')
            )
        );
    END IF;
END
$$;

-- Allow admins to delete students
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'students' 
        AND policyname = 'Admins can delete students'
    ) THEN
        CREATE POLICY "Admins can delete students"
        ON students FOR DELETE
        TO authenticated
        USING (
            tenant_id IN (
                SELECT tenant_id FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'super_admin')
            )
        );
    END IF;
END
$$;

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_students_timestamp ON students;
CREATE TRIGGER update_students_timestamp
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_students_updated_at();

-- Insert sample data (optional, for testing)
-- Note: Replace tenant_id with actual tenant ID from your tenants table
/*
INSERT INTO students (
    tenant_id,
    nis,
    nisn,
    full_name,
    nickname,
    gender,
    birth_place,
    birth_date,
    religion,
    phone,
    email,
    address,
    city,
    province,
    class,
    major,
    academic_year,
    admission_date,
    father_name,
    father_phone,
    mother_name,
    mother_phone,
    status
) VALUES (
    'YOUR_TENANT_ID_HERE',
    '2024001',
    '0051234567',
    'Ahmad Rizki Pratama',
    'Rizki',
    'male',
    'Jakarta',
    '2008-05-15',
    'Islam',
    '081234567890',
    'rizki@example.com',
    'Jl. Sudirman No. 123',
    'Jakarta Selatan',
    'DKI Jakarta',
    '10 IPA 1',
    'IPA',
    '2024/2025',
    '2024-07-15',
    'Budi Pratama',
    '081234567891',
    'Siti Aminah',
    '081234567892',
    'active'
);
*/
