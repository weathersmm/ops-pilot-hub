-- Fix critical security issues in RLS policies

-- 1. Fix profiles table - users can only see their own profile, admins see all
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 2. Fix vehicles table - only authenticated users with appropriate roles can view
DROP POLICY IF EXISTS "Users can view all vehicles" ON public.vehicles;

CREATE POLICY "Authenticated users can view vehicles"
ON public.vehicles
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'supervisor') OR
    has_role(auth.uid(), 'technician') OR
    has_role(auth.uid(), 'viewer')
  )
);

-- 3. Fix audit_log - only admins can view
DROP POLICY IF EXISTS "Users can view audit logs" ON public.audit_log;

CREATE POLICY "Admins can view audit logs"
ON public.audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));