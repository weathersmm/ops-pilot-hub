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
  });
}

export function useVehicleTasks(vehicleId: string) {
  return useQuery({
    queryKey: ["vehicle-tasks", vehicleId],
    queryFn: async () => {
      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("id")
        .eq("vehicle_id", vehicleId)
        .single();

      if (!vehicle) return [];

      const { data, error } = await supabase
        .from("vehicle_tasks")
        .select(`
          *,
          assignee:profiles!vehicle_tasks_assignee_id_fkey (id, full_name, email),
          approver:profiles!vehicle_tasks_approved_by_fkey (id, full_name, email)
        `)
        .eq("vehicle_id", vehicle.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useInspections(vehicleId: string) {
  return useQuery({
    queryKey: ["inspections", vehicleId],
    queryFn: async () => {
      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("id")
        .eq("vehicle_id", vehicleId)
        .single();

      if (!vehicle) return [];

      const { data, error } = await supabase
        .from("inspections")
        .select("*")
        .eq("vehicle_id", vehicle.id)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
