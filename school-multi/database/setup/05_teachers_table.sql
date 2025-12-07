-- Teachers Table Setup (Safe Migration)
-- This script safely drops existing table and recreates it

-- Drop existing table and all associated objects (policies, triggers, indexes)
DROP TABLE IF EXISTS teachers CASCADE;

-- Drop existing function (independent of table)
DROP FUNCTION IF EXISTS update_teachers_updated_at();

-- Note: No need to manually drop policies/indexes as DROP TABLE CASCADE handles them.

-- Create teachers table
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Professional Information
    nip VARCHAR(50) NOT NULL, -- Nomor Induk Pegawai
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    title VARCHAR(50), -- Gelar (S.Pd, M.Pd, etc)
    
    -- Personal Information
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
    
    -- Employment Information
    employment_status VARCHAR(50) CHECK (employment_status IN ('permanent', 'contract', 'part_time', 'honorary')),
    join_date DATE,
    qualification VARCHAR(100), -- Latest education
    major VARCHAR(100), -- Education major
    university VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'resigned')),
    
    -- Additional Information
    photo_url TEXT,
    notes TEXT,
    subjects TEXT[], -- Array of strings for subjects taught
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    UNIQUE(tenant_id, nip)
);

-- Create indexes
CREATE INDEX idx_teachers_tenant_id ON teachers(tenant_id);
CREATE INDEX idx_teachers_nip ON teachers(tenant_id, nip);
CREATE INDEX idx_teachers_status ON teachers(tenant_id, status);
CREATE INDEX idx_teachers_name ON teachers(tenant_id, full_name);

-- Enable RLS
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view teachers from their tenant"
ON teachers FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles 
        WHERE id = auth.uid()
    )
);

CREATE POLICY "Admins can insert teachers"
ON teachers FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Admins can update teachers"
ON teachers FOR UPDATE
TO authenticated
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Admins can delete teachers"
ON teachers FOR DELETE
TO authenticated
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_teachers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_teachers_timestamp
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION update_teachers_updated_at();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Teachers table created successfully!';
END $$;
