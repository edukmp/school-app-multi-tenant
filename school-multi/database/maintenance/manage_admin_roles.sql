-- ==========================================
-- SCRIPT: Manage User Roles Function
-- DESCRIPTION: Creates a secure function to manage user roles programmatically.
--              This allows role updates to be called from the application API 
--              (e.g., by Super Admin) without direct SQL access.
-- ==========================================

-- 1. Create the function to assign roles
CREATE OR REPLACE FUNCTION public.assign_user_role(
    target_email TEXT,
    new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (be careful with permissions!)
AS $$
DECLARE
    target_user_id UUID;
    old_role TEXT;
    result JSONB;
BEGIN
    -- Find the user ID from auth.users
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = target_email;

    -- Check if user exists
    IF target_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not found with email: ' || target_email
        );
    END IF;

    -- Get current role for logging/audit
    SELECT role INTO old_role
    FROM public.profiles
    WHERE id = target_user_id;

    -- Update the role
    UPDATE public.profiles
    SET 
        role = new_role,
        updated_at = NOW()
    WHERE id = target_user_id;

    -- Return success response
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Role updated successfully',
        'data', jsonb_build_object(
            'email', target_email,
            'old_role', COALESCE(old_role, 'none'),
            'new_role', new_role
        )
    );

EXCEPTION WHEN OTHERS THEN
    -- Handle unexpected errors
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error updating role: ' || SQLERRM
    );
END;
$$;

-- 2. Grant execute permission to authenticated users (or restrict to service_role/super_admin only)
--    IMPORTANT: In a real production app, you should restrict this to specific roles!
GRANT EXECUTE ON FUNCTION public.assign_user_role(TEXT, TEXT) TO service_role;
-- GRANT EXECUTE ON FUNCTION public.assign_user_role(TEXT, TEXT) TO authenticated; -- Uncomment if you want to allow API calls (protected by RLS/Logic)

-- ==========================================
-- USAGE EXAMPLES:
-- ==========================================

-- Example 1: Call via SQL
-- SELECT public.assign_user_role('fotoghr@gmail.com', 'admin');

-- Example 2: Call via Supabase Client (JavaScript/TypeScript)
/*
const { data, error } = await supabase
  .rpc('assign_user_role', {
    target_email: 'fotoghr@gmail.com',
    new_role: 'admin'
  })
*/
