-- Update the handle_new_user function to assign admin role to Ops360@LIFELINE-EMS.COM
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_tenant_type text;
BEGIN
  -- Determine tenant type based on email domain or app metadata
  IF NEW.email LIKE '%@lifeline-ems.com' THEN
    v_tenant_type := 'internal';
  ELSE
    v_tenant_type := COALESCE(NEW.raw_app_meta_data->>'tenant_type', 'demo');
  END IF;

  -- Special case: Always assign admin role to Ops360@LIFELINE-EMS.COM
  IF LOWER(NEW.email) = 'ops360@lifeline-ems.com' THEN
    v_role := 'admin';
  ELSE
    -- Check for invitation-based role assignment
    v_role := (
      SELECT role 
      FROM public.user_invitations 
      WHERE email = NEW.email 
        AND status = 'pending'
        AND expires_at > now()
      LIMIT 1
    );
    
    -- Default to viewer if no invitation found
    IF v_role IS NULL THEN
      v_role := 'viewer';
    END IF;
    
    -- Mark invitation as accepted if it exists
    UPDATE public.user_invitations
    SET status = 'accepted', accepted_at = now()
    WHERE email = NEW.email AND status = 'pending';
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, tenant_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    v_tenant_type
  );

  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role::public.app_role);

  RETURN NEW;
END;
$$;