-- Fix 1: Restrict vendor data access to admin and supervisor roles only
DROP POLICY IF EXISTS "Authenticated users can view vendors" ON vendors;
CREATE POLICY "Admins and supervisors can view vendors"
ON vendors FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'supervisor'::app_role)
);

-- Fix 2: Set search_path on update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;