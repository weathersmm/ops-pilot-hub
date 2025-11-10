import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select(`
          *,
          regions (id, code, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select(`
          *,
          regions (id, code, name)
        `)
        .eq("vehicle_id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useVehicleTasks(vehicleId: string) {
  return useQuery({
    queryKey: ["vehicle-tasks", vehicleId],
    queryFn: async () => {
      // Optimized: Single query using join instead of two sequential queries
      const { data, error } = await supabase
        .from("vehicle_tasks")
        .select(`
          *,
          vehicles!inner (vehicle_id),
          assignee:profiles!vehicle_tasks_assignee_id_fkey (id, full_name, email),
          approver:profiles!vehicle_tasks_approved_by_fkey (id, full_name, email)
        `)
        .eq("vehicles.vehicle_id", vehicleId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
}

export function useInspections(vehicleId: string) {
  return useQuery({
    queryKey: ["inspections", vehicleId],
    queryFn: async () => {
      // Optimized: Single query using join instead of two sequential queries
      const { data, error } = await supabase
        .from("inspections")
        .select(`
          *,
          vehicles!inner (vehicle_id)
        `)
        .eq("vehicles.vehicle_id", vehicleId)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
}
