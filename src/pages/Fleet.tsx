import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Search, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicles";
import { useRegions } from "@/hooks/useRegions";
import AddVehicleDialog from "@/components/AddVehicleDialog";
import { useUserRole } from "@/hooks/useUserRole";

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
  Ready: { variant: "default", icon: CheckCircle },
  Commissioning: { variant: "secondary", icon: Clock },
  "Out-of-Service": { variant: "destructive", icon: AlertCircle },
  Draft: { variant: "outline", icon: Clock },
};

export default function Fleet() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const { data: vehicles, isLoading } = useVehicles();
  const { data: regions } = useRegions();
  const { canEditVehicles } = useUserRole();

  // Memoize filtered vehicles to avoid recalculating on every render
  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.vehicle_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
      const matchesRegion = regionFilter === "all" || vehicle.regions?.code === regionFilter;
      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [vehicles, searchQuery, statusFilter, regionFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fleet Management</h1>
          <p className="text-muted-foreground">Vehicle tracking and commissioning</p>
        </div>
        {canEditVehicles && regions && <AddVehicleDialog regions={regions} />}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search vehicles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Commissioning">Commissioning</SelectItem>
                <SelectItem value="Out-of-Service">Out of Service</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {(regions || []).map((region) => (
                  <SelectItem key={region.id} value={region.code}>{region.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => {
          const StatusIcon = statusConfig[vehicle.status]?.icon || Clock;
          return (
            <Link key={vehicle.id} to={`/fleet/${vehicle.vehicle_id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{vehicle.vehicle_id}</CardTitle>
                    </div>
                    <Badge variant={statusConfig[vehicle.status]?.variant || "outline"} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {vehicle.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><p className="text-muted-foreground">Type</p><p className="font-medium">{vehicle.type}</p></div>
                      <div><p className="text-muted-foreground">Region</p><p className="font-medium">{vehicle.regions?.code || 'N/A'}</p></div>
                      <div><p className="text-muted-foreground">Plate</p><p className="font-medium">{vehicle.plate}</p></div>
                      <div><p className="text-muted-foreground">Year</p><p className="font-medium">{vehicle.year}</p></div>
                    </div>
                    <div className="text-xs text-muted-foreground">{vehicle.make} {vehicle.model}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No vehicles found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
