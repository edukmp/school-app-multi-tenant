-- Debug script to check if teachers table exists and structure is correct

-- 1. Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'teachers'
) as table_exists;

-- 2. Inspect columns if it exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'teachers';

-- 3. Check Policies
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'teachers';
