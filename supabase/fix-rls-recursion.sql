-- =============================================================================
-- InnovForms — FIX for Infinite Recursion in RLS Policies (v2)
-- =============================================================================
-- PROBLEM: The original admin policies on `profiles` queried `profiles` itself,
-- causing infinite recursion (error 42P17).
--
-- FIX: Use a SECURITY DEFINER function to check admin role. This function
-- runs with elevated privileges (bypassing RLS) so it can safely read
-- the profiles table without triggering the recursion.
--
-- RUN THIS IN YOUR SUPABASE SQL EDITOR.
-- =============================================================================


-- ==========================================================================
-- STEP 1: Create a helper function to check if a user is admin
-- SECURITY DEFINER means this function bypasses RLS when it runs
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- ==========================================================================
-- STEP 2: Fix PROFILES table policies
-- ==========================================================================
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- Users can read their own profile, admins can read all
CREATE POLICY "Users can read profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR
    public.is_admin()
  );

-- INSERT policy: allow the trigger to insert profiles for new users
DROP POLICY IF EXISTS "Service can insert profiles" ON public.profiles;
CREATE POLICY "Service can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);


-- ==========================================================================
-- STEP 3: Fix FORMS table policies
-- ==========================================================================
DROP POLICY IF EXISTS "Admins have full access to forms" ON public.forms;

CREATE POLICY "Admins have full access to forms"
  ON public.forms FOR ALL
  USING (public.is_admin());


-- ==========================================================================
-- STEP 4: Fix SUBMISSIONS table policies
-- ==========================================================================
DROP POLICY IF EXISTS "Admins can read all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can manage all submissions" ON public.submissions;

CREATE POLICY "Admins can manage all submissions"
  ON public.submissions FOR ALL
  USING (public.is_admin());


-- ==========================================================================
-- STEP 5: Set your admin user's role in auth.users metadata
-- (Change the UUID below if your user ID is different)
-- ==========================================================================
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE id = 'f1d0d07b-fa23-4ddf-a63b-cb1db1748c5d';

-- Make sure the profiles table also has admin role
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'f1d0d07b-fa23-4ddf-a63b-cb1db1748c5d';
