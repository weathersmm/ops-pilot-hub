import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useTenantType } from "@/hooks/useTenantType";
import { Loader2 } from "lucide-react";

interface TenantRouteProps {
  children: ReactNode;
  requiredTenant: "internal" | "demo";
}

/**
 * Route guard that ensures users can only access routes matching their tenant type
 * - Internal users → internal routes only
 * - Demo users → demo routes only
 */
export default function TenantRoute({ children, requiredTenant }: TenantRouteProps) {
  const { tenantType, loading } = useTenantType();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If tenant type doesn't match, redirect appropriately
  if (tenantType !== requiredTenant) {
    if (requiredTenant === "demo") {
      return <Navigate to="/" replace />;
    } else {
      return <Navigate to="/demo" replace />;
    }
  }

  return <>{children}</>;
}
