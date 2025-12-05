-- Add tenant_id column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Enable RLS on tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create new tenants (during onboarding)
-- We use DO block to prevent error if policy already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tenants' 
        AND policyname = 'Allow authenticated users to create tenants'
    ) THEN
        CREATE POLICY "Allow authenticated users to create tenants"
        ON tenants FOR INSERT
        TO authenticated
        WITH CHECK (true);
    END IF;
END
$$;

-- Allow users to view their own tenant (linked via profiles)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tenants' 
        AND policyname = 'Allow users to view their own tenant'
    ) THEN
        CREATE POLICY "Allow users to view their own tenant"
        ON tenants FOR SELECT
        TO authenticated
        USING (
            id IN (
                SELECT tenant_id FROM profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END
$$;

-- Allow admins to update their tenant
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tenants' 
        AND policyname = 'Allow admins to update their own tenant'
    ) THEN
        CREATE POLICY "Allow admins to update their own tenant"
        ON tenants FOR UPDATE
        TO authenticated
        USING (
            id IN (
                SELECT tenant_id FROM profiles 
                WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
            )
        );
    END IF;
END
$$;
