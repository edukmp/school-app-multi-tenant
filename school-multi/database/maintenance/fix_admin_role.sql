-- ==========================================
-- SCRIPT: Fix/Update User Role
-- DESCRIPTION: Updates a user's role in the public.profiles table based on their email.
-- USAGE: Replace 'TARGET_EMAIL_HERE' with the actual user's email before running.
-- ==========================================

-- 1. Set the target email variable (for convenience in some SQL clients)
--    OR just replace the string literal in the query below.

DO $$
DECLARE
    target_email TEXT := 'fotoghr@gmail.com'; -- <<< CHANGE THIS EMAIL
    new_role TEXT := 'admin';                 -- <<< CHANGE ROLE IF NEEDED (e.g., 'admin', 'teacher', 'student')
BEGIN
    -- Perform the update
    UPDATE public.profiles
    SET role = new_role
    WHERE id IN (
        SELECT id 
        FROM auth.users 
        WHERE email = target_email
    );

    -- Log the result (visible in some clients, or just verify with the SELECT below)
    RAISE NOTICE 'Updated role for user % to %', target_email, new_role;
END $$;

-- 2. Verify the update
SELECT p.id, u.email, p.role, p.full_name
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'fotoghr@gmail.com'; -- <<< CHANGE THIS EMAIL TO MATCH ABOVE
