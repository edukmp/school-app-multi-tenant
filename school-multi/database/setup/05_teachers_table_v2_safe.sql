-- Simply create teachers table if it doesn't exist (No DROP)
-- Run this if the previous script fails on DROP or strange errors.

CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Professional Information
    nip VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    title VARCHAR(50),
    
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
    qualification VARCHAR(100),
    major VARCHAR(100),
    university VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'resigned')),
    
    -- Additional Information
    photo_url TEXT,
    notes TEXT,
    subjects TEXT[],
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    UNIQUE(tenant_id, nip)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teachers_tenant_id ON public.teachers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_teachers_nip ON public.teachers(tenant_id, nip);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON public.teachers(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_teachers_name ON public.teachers(tenant_id, full_name);

-- RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Policies (using DO block to avoid error if exists)
DO $$
BEGIN
    -- View policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'teachers' AND policyname = 'Users can view teachers from their tenant'
    ) THEN
        CREATE POLICY "Users can view teachers from their tenant"
        ON public.teachers FOR SELECT
        TO authenticated
        USING (
            tenant_id IN (
                SELECT tenant_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;

    -- Insert policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'teachers' AND policyname = 'Admins can insert teachers'
    ) THEN
        CREATE POLICY "Admins can insert teachers"
        ON public.teachers FOR INSERT
        TO authenticated
        WITH CHECK (
            tenant_id IN (
                SELECT tenant_id FROM public.profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'super_admin')
            )
        );
    END IF;

    -- Update policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'teachers' AND policyname = 'Admins can update teachers'
    ) THEN
        CREATE POLICY "Admins can update teachers"
        ON public.teachers FOR UPDATE
        TO authenticated
        USING (
            tenant_id IN (
                SELECT tenant_id FROM public.profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'super_admin')
            )
        );
    END IF;

    -- Delete policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'teachers' AND policyname = 'Admins can delete teachers'
    ) THEN
        CREATE POLICY "Admins can delete teachers"
        ON public.teachers FOR DELETE
        TO authenticated
        USING (
            tenant_id IN (
                SELECT tenant_id FROM public.profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'super_admin')
            )
        );
    END IF;
END $$;

-- Trigger Function
CREATE OR REPLACE FUNCTION public.update_teachers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS update_teachers_timestamp ON public.teachers;
CREATE TRIGGER update_teachers_timestamp
    BEFORE UPDATE ON public.teachers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_teachers_updated_at();

GRANT ALL ON public.teachers TO authenticated;
GRANT ALL ON public.teachers TO service_role;
