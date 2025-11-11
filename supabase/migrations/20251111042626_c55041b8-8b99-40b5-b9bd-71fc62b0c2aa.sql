-- Add RLS policies for demo_vehicle_equipment
CREATE POLICY "Demo users can view demo equipment"
ON public.demo_vehicle_equipment FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tenant_type = 'demo'
  )
);

CREATE POLICY "Demo users can manage demo equipment"
ON public.demo_vehicle_equipment FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tenant_type = 'demo'
  )
);

-- Add RLS policies for demo_inspections
CREATE POLICY "Demo users can view demo inspections"
ON public.demo_inspections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tenant_type = 'demo'
  )
);

CREATE POLICY "Demo users can manage demo inspections"
ON public.demo_inspections FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tenant_type = 'demo'
  )
);

-- Add RLS policies for demo_evidence_files
CREATE POLICY "Demo users can view demo evidence"
ON public.demo_evidence_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tenant_type = 'demo'
  )
);

CREATE POLICY "Demo users can manage demo evidence"
ON public.demo_evidence_files FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tenant_type = 'demo'
  )
);