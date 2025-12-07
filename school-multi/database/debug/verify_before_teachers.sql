-- Verify that prerequisites exist for the teachers table
DO $$
BEGIN
    -- Check if tenants table exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants'
    ) THEN
        RAISE EXCEPTION '❌ Table public.tenants does not exist! Please ensure tenants table is created first.';
    ELSE
        RAISE NOTICE '✅ Table public.tenants exists.';
    END IF;

    -- Check if profiles table exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) THEN
        RAISE EXCEPTION '❌ Table public.profiles does not exist! Please ensure profiles table is created first.';
    ELSE
        RAISE NOTICE '✅ Table public.profiles exists.';
    END IF;

    RAISE NOTICE '✅ Dependencies verified. You can proceed with creating the teachers table.';
END $$;
