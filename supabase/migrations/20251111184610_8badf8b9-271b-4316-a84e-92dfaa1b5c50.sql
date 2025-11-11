-- Fix SSO role assignment: Update handle_new_user() to assign default 'viewer' role
-- This resolves the critical issue where SSO users authenticate but cannot access data

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, tenant_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'tenant_type')::public.tenant_type, 'internal')
  );
  
  -- Assign default viewer role for new users (fixes SSO role assignment)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$function$;