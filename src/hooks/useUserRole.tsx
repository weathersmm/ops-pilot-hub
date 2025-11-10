import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type Role = "admin" | "supervisor" | "technician" | "viewer" | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setRole(data.role as Role);
      }
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const hasRole = (...roles: string[]) => {
    return role && roles.includes(role);
  };

  const canEditVehicles = hasRole("admin", "supervisor", "technician");
  const canApprove = hasRole("admin", "supervisor");
  const isAdmin = hasRole("admin");

  return {
    role,
    loading,
    hasRole,
    canEditVehicles,
    canApprove,
    isAdmin,
  };
}
