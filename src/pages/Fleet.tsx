import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Search, Plus, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

type VehicleStatus = "Ready" | "Commissioning" | "Out-of-Service" | "Draft";
type VehicleType = "ALS" | "BLS" | "CCT" | "Supervisor";

interface Vehicle {
  id: string;
  vin: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  region: string;
  status: VehicleStatus;
  tasksComplete: number;
  tasksTotal: number;
  nextInspection?: string;
}

const mockVehicles: Vehicle[] = [
  {
    id: "E450-OC-1023",
    vin: "1FDXE45P84HB12345",
    plate: "AMB-1023",
    make: "Ford",
    model: "E-450",
    year: 2023,
    type: "ALS",
    region: "OC",
    status: "Ready",
    tasksComplete: 45,
    tasksTotal: 45,
    nextInspection: "2025-02-15",
  },
  {
    id: "SPRINTER-LA-2041",
    vin: "WD3PE8CD5E5123456",
    plate: "AMB-2041",
    make: "Mercedes",
    model: "Sprinter",
    year: 2024,
    type: "BLS",
    region: "LA",
    status: "Commissioning",
    tasksComplete: 32,
    tasksTotal: 45,
  },
  {
    id: "F350-UCI-3015",
    vin: "1FT8W3BT8GEB12345",
    plate: "AMB-3015",
    make: "Ford",
    model: "F-350",
    year: 2023,
    type: "CCT",
    region: "UCI",
    status: "Commissioning",
    tasksComplete: 18,
    tasksTotal: 50,
  },
  {
    id: "TAHOE-KP-4002",
    vin: "1GNSKCKD2JR123456",
    plate: "SUP-4002",
    make: "Chevrolet",
    model: "Tahoe",
    year: 2022,
    type: "Supervisor",
    region: "KP",
    status: "Ready",
    tasksComplete: 30,
    tasksTotal: 30,
    nextInspection: "2025-03-01",
  },
  {
    id: "E450-RIV-5008",
    vin: "1FDXE45P85HB67890",
    plate: "AMB-5008",
    make: "Ford",
    model: "E-450",
    year: 2021,
    type: "ALS",
    region: "RIV",
    status: "Out-of-Service",
    tasksComplete: 45,
    tasksTotal: 45,
  },
];

const statusConfig: Record<VehicleStatus, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  Ready: { variant: "default", icon: CheckCircle },
  Commissioning: { variant: "secondary", icon: Clock },
  "Out-of-Service": { variant: "destructive", icon: AlertCircle },
  Draft: { variant: "outline", icon: Clock },
};

export default function Fleet() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const filteredVehicles = mockVehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    const matchesRegion = regionFilter === "all" || vehicle.region === regionFilter;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const regions = ["OC", "LA", "UCI", "KP", "RIV"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fleet Management</h1>
          <p className="text-muted-foreground">Vehicle tracking and commissioning</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Commissioning">Commissioning</SelectItem>
                <SelectItem value="Out-of-Service">Out of Service</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => {
          const StatusIcon = statusConfig[vehicle.status].icon;
          const progress = Math.round((vehicle.tasksComplete / vehicle.tasksTotal) * 100);

          return (
            <Link key={vehicle.id} to={`/fleet/${vehicle.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{vehicle.id}</CardTitle>
                    </div>
                    <Badge variant={statusConfig[vehicle.status].variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {vehicle.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium">{vehicle.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Region</p>
                        <p className="font-medium">{vehicle.region}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Plate</p>
                        <p className="font-medium">{vehicle.plate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Year</p>
                        <p className="font-medium">{vehicle.year}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Commissioning</span>
                        <span className="font-medium">
                          {vehicle.tasksComplete}/{vehicle.tasksTotal}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {vehicle.nextInspection && (
                      <div className="text-xs text-muted-foreground">
                        Next inspection: {new Date(vehicle.nextInspection).toLocaleDateString()}
                      </div>
                    )}
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
