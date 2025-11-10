-- Extend schema for CSV workflow data

-- Add missing fields to vehicles table
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS build_type text,
ADD COLUMN IF NOT EXISTS mod_type text,
ADD COLUMN IF NOT EXISTS commissioning_template text,
ADD COLUMN IF NOT EXISTS chp_permit text,
ADD COLUMN IF NOT EXISTS dmv_expiration date,
ADD COLUMN IF NOT EXISTS smog_expiration date,
ADD COLUMN IF NOT EXISTS oc_expiration date,
ADD COLUMN IF NOT EXISTS la_county_expiration date,
ADD COLUMN IF NOT EXISTS riverside_expiration date,
ADD COLUMN IF NOT EXISTS status_date date;

-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id text UNIQUE NOT NULL,
  name text NOT NULL,
  service text,
  contact text,
  phone text,
  email text,
  sla_hours integer DEFAULT 24,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vendors"
ON public.vendors FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'supervisor') OR
    has_role(auth.uid(), 'technician') OR
    has_role(auth.uid(), 'viewer')
  )
);

CREATE POLICY "Admins and supervisors can manage vendors"
ON public.vendors FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'supervisor')
);

-- Create equipment_catalog table
CREATE TABLE IF NOT EXISTS public.equipment_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id text UNIQUE NOT NULL,
  name text NOT NULL,
  category text,
  manufacturer text,
  model text,
  part_number text,
  description text,
  service_interval_miles integer,
  service_interval_days integer,
  requires_calibration boolean DEFAULT false,
  evidence_type text,
  vendor_id uuid REFERENCES public.vendors(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.equipment_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view equipment"
ON public.equipment_catalog FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'supervisor') OR
    has_role(auth.uid(), 'technician') OR
    has_role(auth.uid(), 'viewer')
  )
);

CREATE POLICY "Admins and supervisors can manage equipment"
ON public.equipment_catalog FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'supervisor')
);

-- Create vehicle_equipment junction table
CREATE TABLE IF NOT EXISTS public.vehicle_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  equipment_id uuid REFERENCES public.equipment_catalog(id) ON DELETE CASCADE NOT NULL,
  installed_date date,
  last_service_date date,
  next_service_date date,
  serial_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vehicle_id, equipment_id)
);

ALTER TABLE public.vehicle_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vehicle equipment"
ON public.vehicle_equipment FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'supervisor') OR
    has_role(auth.uid(), 'technician') OR
    has_role(auth.uid(), 'viewer')
  )
);

CREATE POLICY "Techs and above can manage vehicle equipment"
ON public.vehicle_equipment FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'supervisor') OR
  has_role(auth.uid(), 'technician')
);

-- Add triggers for updated_at
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_equipment_catalog_updated_at
  BEFORE UPDATE ON public.equipment_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_vehicle_equipment_updated_at
  BEFORE UPDATE ON public.vehicle_equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();