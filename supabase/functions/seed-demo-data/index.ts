import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id } = await req.json();

    console.log('Seeding demo data for user:', user_id);

    // Verify user is a demo user
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_type')
      .eq('id', user_id)
      .single();

    if (profile?.tenant_type !== 'demo') {
      throw new Error('User is not a demo user');
    }

    // Create demo vehicles
    const demoVehicles = [
      {
        vehicle_id: 'DEMO-001',
        vin: 'DEMO17CHARVIN0001',
        year: 2023,
        make: 'Ford',
        model: 'E-450',
        plate: 'DEMO001',
        type: 'ALS',
        status: 'Active',
        fuel_type: 'Diesel',
        build_type: 'Type III',
        mod_type: 'Standard',
        primary_depot: 'Demo Depot',
      },
      {
        vehicle_id: 'DEMO-002',
        vin: 'DEMO17CHARVIN0002',
        year: 2024,
        make: 'Mercedes',
        model: 'Sprinter',
        plate: 'DEMO002',
        type: 'BLS',
        status: 'Commissioning',
        fuel_type: 'Diesel',
        build_type: 'Type II',
        mod_type: 'Standard',
        primary_depot: 'Demo Depot',
      },
      {
        vehicle_id: 'DEMO-003',
        vin: 'DEMO17CHARVIN0003',
        year: 2023,
        make: 'Chevrolet',
        model: 'Express',
        plate: 'DEMO003',
        type: 'CCT',
        status: 'Draft',
        fuel_type: 'Gas',
        build_type: 'Type I',
        mod_type: 'Custom',
        primary_depot: 'Demo Depot',
      },
    ];

    const { data: insertedVehicles, error: vehiclesError } = await supabase
      .from('demo_vehicles')
      .insert(demoVehicles)
      .select();

    if (vehiclesError) throw vehiclesError;

    console.log(`Created ${insertedVehicles.length} demo vehicles`);

    // Create demo tasks for the commissioning vehicle
    if (insertedVehicles && insertedVehicles.length > 1) {
      const commissioningVehicle = insertedVehicles[1];
      
      const demoTasks = [
        {
          vehicle_id: commissioningVehicle.id,
          step_name: 'Initial Inspection',
          step_category: 'Inspection',
          status: 'Completed',
          percent_complete: 100,
          requires_evidence: true,
          requires_approval: false,
          sla_hours: 24,
        },
        {
          vehicle_id: commissioningVehicle.id,
          step_name: 'Equipment Installation',
          step_category: 'Equipment',
          status: 'In Progress',
          percent_complete: 60,
          requires_evidence: true,
          requires_approval: true,
          sla_hours: 48,
        },
        {
          vehicle_id: commissioningVehicle.id,
          step_name: 'Final Testing',
          step_category: 'Testing',
          status: 'Not Started',
          percent_complete: 0,
          requires_evidence: true,
          requires_approval: true,
          sla_hours: 24,
        },
      ];

      const { error: tasksError } = await supabase
        .from('demo_vehicle_tasks')
        .insert(demoTasks);

      if (tasksError) throw tasksError;
      console.log(`Created ${demoTasks.length} demo tasks`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo data seeded successfully',
        vehicles: insertedVehicles.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error seeding demo data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
