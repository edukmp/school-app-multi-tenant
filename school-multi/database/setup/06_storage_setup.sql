-- Storage Bucket Setup for Public Access (Multi-Tenant Compatible)

-- 1. Create a public bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create policy to allow public READ access to everything in 'public' bucket
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'public' );

-- 3. Create policy to allow authenticated users to UPLOAD to 'teacher-photos' folder
--    Path MUST match: teacher-photos/{tenant_id}/*
DROP POLICY IF EXISTS "Teachers Upload Access" ON storage.objects;
CREATE POLICY "Teachers Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'public' 
    AND (storage.foldername(name))[1] = 'teacher-photos'
    -- Ensure user belongs to the tenant they are uploading for
    AND (storage.foldername(name))[2] IN (
        SELECT tenant_id::text 
        FROM public.profiles 
        WHERE id = auth.uid()
    )
);

-- 4. Create policy to allow authenticated users to UPDATE their own uploads
DROP POLICY IF EXISTS "Teachers Update Access" ON storage.objects;
CREATE POLICY "Teachers Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'public' 
    AND (storage.foldername(name))[1] = 'teacher-photos'
    AND owner = auth.uid()
);

-- 5. Create policy to allow authenticated users to DELETE their own uploads
DROP POLICY IF EXISTS "Teachers Delete Access" ON storage.objects;
CREATE POLICY "Teachers Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'public' 
    AND (storage.foldername(name))[1] = 'teacher-photos'
    AND owner = auth.uid()
);

-- Verify setup
DO $$
BEGIN
    RAISE NOTICE '✅ Storage bucket "public" configured successfully.';
    RAISE NOTICE '✅ Policies for "teacher-photos" folder applied.';
END $$;
