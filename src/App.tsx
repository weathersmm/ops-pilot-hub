import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import TenantRoute from "./components/TenantRoute";
import { Loader2 } from "lucide-react";
import { isDemoMode } from "@/config/appMode";

// Lazy load pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const Fleet = lazy(() => import("./pages/Fleet"));
const VehicleDetail = lazy(() => import("./pages/VehicleDetail"));
const Executive = lazy(() => import("./pages/Executive"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Smartsheet = lazy(() => import("./pages/Smartsheet"));
const DemoLanding = lazy(() => import("./pages/DemoLanding"));
const DemoAuth = lazy(() => import("./pages/DemoAuth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
  },
});

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Demo mode routes */}
            {isDemoMode && (
              <>
                <Route path="/demo" element={<DemoLanding />} />
                <Route path="/demo/login" element={<DemoAuth />} />
                <Route path="/demo/signup" element={<DemoAuth />} />
              </>
            )}
            
            {/* Internal mode auth */}
            {!isDemoMode && <Route path="/auth" element={<Auth />} />}
            
            {/* Protected application routes */}
            <Route path="/*" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<TenantRoute requiredTenant="internal"><Index /></TenantRoute>} />
              <Route path="fleet" element={<TenantRoute requiredTenant="internal"><Fleet /></TenantRoute>} />
              <Route path="fleet/:id" element={<TenantRoute requiredTenant="internal"><VehicleDetail /></TenantRoute>} />
              <Route path="executive" element={<TenantRoute requiredTenant="internal"><Executive /></TenantRoute>} />
              <Route path="smartsheet" element={<TenantRoute requiredTenant="internal"><Smartsheet /></TenantRoute>} />
              <Route path="admin" element={<AdminRoute><TenantRoute requiredTenant="internal"><Admin /></TenantRoute></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
