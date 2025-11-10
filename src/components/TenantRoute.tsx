import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTenantType } from "@/hooks/useTenantType";
import { isLandingEntry, isDemoEntry, isInternalEntry } from "@/config/entryMode";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface TenantRouteProps {
  children: ReactNode;
  requiredTenant: "internal" | "demo";
}

/**
 * Route guard that ensures users can only access routes matching their tenant type
 * AND respects entry mode restrictions:
 * - Internal users → internal routes only
 * - Demo users → demo routes only
 * - Landing mode: enforces strict separation
 * - Internal-only mode: blocks demo routes entirely
 * - Demo-only mode: blocks internal routes entirely
 */
export default function TenantRoute({ children, requiredTenant }: TenantRouteProps) {
  const { tenantType, loading } = useTenantType();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Show warning toast when access is denied due to tenant mismatch
    if (!loading && tenantType && tenantType !== requiredTenant) {
      toast({
        title: "Access Denied",
        description: `This area is restricted to ${requiredTenant} users only.`,
        variant: "destructive",
      });
    }
  }, [tenantType, requiredTenant, loading, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Entry mode enforcement
  if (isDemoEntry && requiredTenant === "internal") {
    // Demo-only deployment: block all internal routes
    return <Navigate to="/demo" replace />;
  }

  if (isInternalEntry && requiredTenant === "demo") {
    // Internal-only deployment: block all demo routes
    return <Navigate to="/" replace />;
  }

  // Tenant type mismatch enforcement
  if (tenantType !== requiredTenant) {
    if (requiredTenant === "demo") {
      // Demo route accessed by internal user
      if (isLandingEntry) {
        return <Navigate to="/" replace />;
      }
      return <Navigate to="/auth" replace />;
    } else {
      // Internal route accessed by demo user
      if (isLandingEntry) {
        return <Navigate to="/demo" replace />;
      }
      return <Navigate to="/demo/login" replace />;
    }
  }

  return <>{children}</>;
}
