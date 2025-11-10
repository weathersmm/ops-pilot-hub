-- Add tenant type enum for internal vs demo users
CREATE TYPE public.tenant_type AS ENUM ('internal', 'demo');

-- Add tenant_type column to profiles
ALTER TABLE public.profiles 
ADD COLUMN tenant_type public.tenant_type NOT NULL DEFAULT 'internal';

-- Update handle_new_user function to support tenant type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, tenant_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'tenant_type')::public.tenant_type, 'internal')
  );
  RETURN NEW;
END;
$$;

-- Create demo data tables by duplicating key tables with demo prefix
CREATE TABLE public.demo_vehicles (LIKE public.vehicles INCLUDING ALL);
CREATE TABLE public.demo_vehicle_tasks (LIKE public.vehicle_tasks INCLUDING ALL);
CREATE TABLE public.demo_vehicle_equipment (LIKE public.vehicle_equipment INCLUDING ALL);
CREATE TABLE public.demo_inspections (LIKE public.inspections INCLUDING ALL);
CREATE TABLE public.demo_evidence_files (LIKE public.evidence_files INCLUDING ALL);

-- Enable RLS on demo tables
ALTER TABLE public.demo_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_vehicle_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_vehicle_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_evidence_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for demo tables (demo users can only access demo tables)
CREATE POLICY "Demo users can view demo vehicles"
ON public.demo_vehicles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tenant_type = 'demo'
  )
);

CREATE POLICY "Demo users can manage demo vehicles"
ON public.demo_vehicles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tenant_type = 'demo'
  )
);

CREATE POLICY "Demo users can view demo tasks"
ON public.demo_vehicle_tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tenant_type = 'demo'
  )
);

CREATE POLICY "Demo users can manage demo tasks"
ON public.demo_vehicle_tasks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tenant_type = 'demo'
  )
);

-- Update existing vehicles RLS to block demo users
DROP POLICY IF EXISTS "Authenticated users can view vehicles" ON public.vehicles;
CREATE POLICY "Internal users can view vehicles"
ON public.vehicles FOR SELECT
USING (
  (auth.uid() IS NOT NULL) AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tenant_type = 'internal'
  ) AND
  (has_role(auth.uid(), 'admin'::app_role) OR 
   has_role(auth.uid(), 'supervisor'::app_role) OR 
   has_role(auth.uid(), 'technician'::app_role) OR 
   has_role(auth.uid(), 'viewer'::app_role))
);

-- Update existing vehicle_tasks RLS to block demo users
DROP POLICY IF EXISTS "Users can view all tasks" ON public.vehicle_tasks;
CREATE POLICY "Internal users can view all tasks"
ON public.vehicle_tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tenant_type = 'internal'
  )
);