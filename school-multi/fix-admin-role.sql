-- Update the role for the specific user to 'admin'
-- Replace 'fotoghr@gmail.com' with the actual email if different
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
    SELECT id 
    FROM auth.users 
    WHERE email = 'fotoghr@gmail.com'
);

-- Verify the update
SELECT * FROM public.profiles 
WHERE id IN (
    SELECT id 
    FROM auth.users 
    WHERE email = 'fotoghr@gmail.com'
);
