-- ============================================
-- FIX RLS PERFORMANCE - AGGRESSIVE VERSION
-- ============================================
-- This will forcefully drop and recreate all policies
-- Run this in Supabase SQL Editor
-- ============================================

BEGIN;

-- 1. PROFILES TABLE (CRITICAL)
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles CASCADE;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING ((SELECT auth.uid()) = id);


-- 2. TENANTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Super admins can manage tenants" ON public.tenants CASCADE;

CREATE POLICY "Super admins can manage tenants" 
ON public.tenants FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'super_admin'
  )
);


-- 3. MODULES TABLE
-- ============================================
DROP POLICY IF EXISTS "Super admins can manage modules" ON public.modules CASCADE;

CREATE POLICY "Super admins can manage modules" 
ON public.modules FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'super_admin'
  )
);


-- 4. STUDENTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view students in their tenant" ON public.students CASCADE;
DROP POLICY IF EXISTS "Admins can manage students" ON public.students CASCADE;

CREATE POLICY "Users can view students in their tenant" 
ON public.students FOR SELECT 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles 
    WHERE id = (SELECT auth.uid())
  )
);

CREATE POLICY "Admins can manage students" 
ON public.students FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role IN ('admin', 'super_admin')
    AND (tenant_id = students.tenant_id OR role = 'super_admin')
  )
);


-- 5. PAYMENT_SUBMISSIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view payments in their tenant" ON public.payment_submissions CASCADE;

CREATE POLICY "Users can view payments in their tenant" 
ON public.payment_submissions FOR SELECT 
USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE tenant_id IN (
      SELECT tenant_id FROM public.profiles 
      WHERE id = (SELECT auth.uid())
    )
  )
);


-- 6. MEETINGS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view meetings in their tenant" ON public.meetings CASCADE;
DROP POLICY IF EXISTS "Admins and staff can manage meetings" ON public.meetings CASCADE;

CREATE POLICY "Users can view meetings in their tenant" 
ON public.meetings FOR SELECT 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles 
    WHERE id = (SELECT auth.uid())
  )
);

CREATE POLICY "Admins and staff can manage meetings" 
ON public.meetings FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role IN ('admin', 'staff', 'super_admin')
    AND (tenant_id = meetings.tenant_id OR role = 'super_admin')
  )
);


-- 7. USER_ROLES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles CASCADE;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles CASCADE;
DROP POLICY IF EXISTS "Tenant admins can view roles in their tenant" ON public.user_roles CASCADE;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Tenant admins can view roles in their tenant" 
ON public.user_roles FOR SELECT 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'admin'
  )
);

COMMIT;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
SELECT 
  tablename,
  policyname,
  CASE 
    WHEN qual::text LIKE '%auth.uid()%' 
      AND qual::text NOT LIKE '%(SELECT auth.uid())%' 
    THEN '❌ NEEDS FIX'
    ELSE '✅ OPTIMIZED'
  END as status,
  LEFT(qual::text, 100) as policy_condition
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'tenants', 'modules', 'students', 'payment_submissions', 'meetings', 'user_roles')
ORDER BY tablename, policyname;
