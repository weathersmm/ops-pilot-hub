-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'supervisor', 'technician', 'viewer');
CREATE TYPE public.vehicle_status AS ENUM ('Draft', 'Commissioning', 'Ready', 'Out-of-Service', 'Decommissioned');
CREATE TYPE public.vehicle_type AS ENUM ('ALS', 'BLS', 'CCT', 'Supervisor', 'Other');
CREATE TYPE public.task_status AS ENUM ('Not Started', 'In Progress', 'Blocked', 'Submitted', 'Approved', 'Rejected');
CREATE TYPE public.task_category AS ENUM ('Safety', 'Compliance', 'Logistics', 'IT', 'Branding', 'Clinical', 'Admin');
CREATE TYPE public.inspection_result AS ENUM ('Pass', 'Fail', 'Pending');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create regions table
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  policy_links TEXT,
  cert_checklist_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id TEXT UNIQUE NOT NULL,
  vin TEXT UNIQUE NOT NULL,
  plate TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  type vehicle_type NOT NULL DEFAULT 'ALS',
  region_id UUID REFERENCES public.regions(id),
  status vehicle_status NOT NULL DEFAULT 'Draft',
  in_service_date DATE,
  odometer INTEGER DEFAULT 0,
  fuel_type TEXT,
  primary_depot TEXT,
  radio_id TEXT,
  lytx_id TEXT,
  last_chp_inspection DATE,
  next_chp_inspection DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_templates table
CREATE TABLE public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  region_id UUID REFERENCES public.regions(id),
  vehicle_type vehicle_type NOT NULL,
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_category task_category NOT NULL,
  sla_hours INTEGER DEFAULT 24,
  requires_evidence BOOLEAN DEFAULT FALSE,
  requires_approval BOOLEAN DEFAULT FALSE,
  evidence_type TEXT,
  dependent_step_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, step_order)
);

-- Create vehicle_tasks table
CREATE TABLE public.vehicle_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  template_id TEXT,
  step_name TEXT NOT NULL,
  step_category task_category NOT NULL,
  assignee_id UUID REFERENCES public.profiles(id),
  due_date DATE,
  status task_status NOT NULL DEFAULT 'Not Started',
  percent_complete INTEGER DEFAULT 0,
  notes TEXT,
  evidence_url TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_on TIMESTAMPTZ,
  sla_hours INTEGER DEFAULT 24,
  requires_evidence BOOLEAN DEFAULT FALSE,
  requires_approval BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inspections table
CREATE TABLE public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  result inspection_result DEFAULT 'Pending',
  inspector TEXT,
  findings TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create evidence_files table
CREATE TABLE public.evidence_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.vehicle_tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_log table
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_vehicle_tasks_updated_at
  BEFORE UPDATE ON public.vehicle_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for regions
CREATE POLICY "Everyone can view regions"
  ON public.regions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage regions"
  ON public.regions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for vehicles
CREATE POLICY "Users can view all vehicles"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Techs and above can create vehicles"
  ON public.vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'supervisor') OR
    public.has_role(auth.uid(), 'technician')
  );

CREATE POLICY "Techs and above can update vehicles"
  ON public.vehicles FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'supervisor') OR
    public.has_role(auth.uid(), 'technician')
  );

CREATE POLICY "Admins can delete vehicles"
  ON public.vehicles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for task_templates
CREATE POLICY "Users can view task templates"
  ON public.task_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Supervisors and admins can manage templates"
  ON public.task_templates FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'supervisor')
  );

-- RLS Policies for vehicle_tasks
CREATE POLICY "Users can view all tasks"
  ON public.vehicle_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Techs can create tasks"
  ON public.vehicle_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'supervisor') OR
    public.has_role(auth.uid(), 'technician')
  );

CREATE POLICY "Assigned users and supervisors can update tasks"
  ON public.vehicle_tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = assignee_id OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Supervisors can delete tasks"
  ON public.vehicle_tasks FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'supervisor')
  );

-- RLS Policies for inspections
CREATE POLICY "Users can view all inspections"
  ON public.inspections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Techs and above can manage inspections"
  ON public.inspections FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'supervisor') OR
    public.has_role(auth.uid(), 'technician')
  );

-- RLS Policies for evidence_files
CREATE POLICY "Users can view all evidence"
  ON public.evidence_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upload evidence"
  ON public.evidence_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Uploaders and admins can manage evidence"
  ON public.evidence_files FOR ALL
  TO authenticated
  USING (
    auth.uid() = uploaded_by OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for audit_log
CREATE POLICY "Users can view audit logs"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit logs"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default regions
INSERT INTO public.regions (code, name) VALUES
  ('OC', 'Orange County'),
  ('LA', 'Los Angeles'),
  ('UCI', 'UC Irvine'),
  ('KP', 'Kaiser Permanente'),
  ('RIV', 'Riverside');

-- Insert sample task templates for ALS vehicles in OC region
INSERT INTO public.task_templates (template_id, name, region_id, vehicle_type, step_order, step_name, step_category, sla_hours, requires_evidence, requires_approval, evidence_type)
SELECT 
  'ALS-OC-TEMPLATE',
  'ALS Commissioning - Orange County',
  r.id,
  'ALS'::vehicle_type,
  step_order,
  step_name,
  step_category::task_category,
  sla_hours,
  requires_evidence,
  requires_approval,
  evidence_type
FROM public.regions r
CROSS JOIN (VALUES
  (1, 'Vehicle Inspection', 'Safety', 24, true, true, 'PDF'),
  (2, 'CHP Inspection', 'Compliance', 48, true, true, 'PDF'),
  (3, 'Camera Installation', 'IT', 24, true, false, 'Image'),
  (4, 'Radio/CAD Configuration', 'IT', 48, true, true, 'Doc'),
  (5, 'Decals Application', 'Branding', 16, true, false, 'Image'),
  (6, 'Equipment Inventory', 'Logistics', 24, true, true, 'PDF'),
  (7, 'Regional Certification', 'Compliance', 72, true, true, 'PDF'),
  (8, 'EHR System Setup', 'Clinical', 48, true, true, 'Doc'),
  (9, 'Final Safety Check', 'Safety', 24, true, true, 'PDF'),
  (10, 'Operational Readiness Review', 'Admin', 48, true, true, 'PDF')
) AS t(step_order, step_name, step_category, sla_hours, requires_evidence, requires_approval, evidence_type)
WHERE r.code = 'OC';