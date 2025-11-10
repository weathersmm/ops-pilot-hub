import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type Role = "admin" | "supervisor" | "technician" | "viewer" | null;

/**
 * Client-side role checks for UI rendering ONLY.
 * 
 * ⚠️ SECURITY WARNING: Never rely on these checks for security decisions.
 * All sensitive operations are protected server-side via RLS policies.
 * These helpers are purely for improving user experience by hiding
 * unavailable functionality.
 * 
 * @example
 * // ✅ CORRECT: Use for UI rendering
 * const { canEditVehicles } = useUserRole();
 * {canEditVehicles && <EditButton />}
 * 
 * // ❌ INCORRECT: Never use for security decisions
 * // All security must be enforced via RLS policies on the database
 * 
 * @security
 * When implementing edge functions, ALWAYS validate roles server-side:
 * ```typescript
 * const { data: { user } } = await supabase.auth.getUser();
 * const { data: roleData } = await supabase
 *   .from('user_roles')
 *   .select('role')
 *   .eq('user_id', user.id)
 *   .single();
 * 
 * if (roleData?.role !== 'admin') {
 *   return new Response('Forbidden', { status: 403 });
 * }
 * ```
 */
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
