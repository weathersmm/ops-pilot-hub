-- Fix profiles table RLS policy to require authentication
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING ((auth.uid() IS NOT NULL) AND (auth.uid() = id));