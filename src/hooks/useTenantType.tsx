import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type TenantType = "internal" | "demo" | null;

/**
 * Hook to get the current user's tenant type (internal vs demo)
 * 
 * This determines which data the user can access:
 * - internal: Access to real production data
 * - demo: Access only to mock/demo data
 */
export function useTenantType() {
  const { user } = useAuth();
  const [tenantType, setTenantType] = useState<TenantType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTenantType(null);
      setLoading(false);
      return;
    }

    const fetchTenantType = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("tenant_type")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setTenantType(data.tenant_type as TenantType);
      }
      setLoading(false);
    };

    fetchTenantType();
  }, [user]);

  return {
    tenantType,
    loading,
    isInternal: tenantType === "internal",
    isDemo: tenantType === "demo",
  };
}
