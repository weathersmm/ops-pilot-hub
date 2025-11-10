import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, FileText, Camera } from "lucide-react";

export default function VehicleDetail() {
  const { id } = useParams();

  // Mock data
  const vehicle = {
    id: id || "E450-OC-1023",
    vin: "1FDXE45P84HB12345",
    plate: "AMB-1023",
    make: "Ford",
    model: "E-450",
    year: 2023,
    type: "ALS",
    region: "OC",
    status: "Commissioning",
    inServiceDate: "2024-01-15",
  };

  const tasks = [
    { id: 1, name: "CHP Inspection", category: "Compliance", status: "Approved", dueDate: "2025-01-10", progress: 100 },
    { id: 2, name: "Camera Setup", category: "IT", status: "Submitted", dueDate: "2025-01-12", progress: 90 },
    { id: 3, name: "Decals Application", category: "Branding", status: "In Progress", dueDate: "2025-01-15", progress: 60 },
    { id: 4, name: "Radio/CAD Configuration", category: "IT", status: "Not Started", dueDate: "2025-01-18", progress: 0 },
    { id: 5, name: "Regional Certification", category: "Compliance", status: "Not Started", dueDate: "2025-01-20", progress: 0 },
  ];

  const inspections = [
    { id: 1, type: "CHP", date: "2024-12-15", result: "Pass", inspector: "CHP Unit 45" },
    { id: 2, type: "Internal", date: "2025-01-05", result: "Pass", inspector: "Safety Team" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "Submitted":
        return <Clock className="h-4 w-4 text-primary" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default";
      case "Submitted":
      case "In Progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/fleet">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fleet
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{vehicle.id}</h1>
            <p className="text-muted-foreground">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Commissioning
          </Badge>
        </div>
      </div>

      {/* Vehicle Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">VIN</p>
              <p className="font-medium">{vehicle.vin}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Plate</p>
              <p className="font-medium">{vehicle.plate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Type</p>
              <p className="font-medium">{vehicle.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Region</p>
              <p className="font-medium">{vehicle.region}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">In-Service Date</p>
              <p className="font-medium">{new Date(vehicle.inServiceDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commissioning Tasks</CardTitle>
              <CardDescription>Track and manage vehicle commissioning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                    <div className="flex-shrink-0">{getStatusIcon(task.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h4 className="font-medium">{task.name}</h4>
                          <p className="text-sm text-muted-foreground">{task.category}</p>
                        </div>
                        <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle>Evidence & Documentation</CardTitle>
              <CardDescription>Uploaded files and inspection records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-medium">CHP Inspection Report.pdf</h4>
                    <p className="text-sm text-muted-foreground">Uploaded 2024-12-15</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Camera className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-medium">Camera Installation Photos</h4>
                    <p className="text-sm text-muted-foreground">3 images • Uploaded 2025-01-08</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections">
          <Card>
            <CardHeader>
              <CardTitle>Inspection History</CardTitle>
              <CardDescription>Past and upcoming vehicle inspections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inspections.map((inspection) => (
                  <div key={inspection.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div>
                      <h4 className="font-medium">{inspection.type} Inspection</h4>
                      <p className="text-sm text-muted-foreground">{inspection.inspector}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(inspection.date).toLocaleDateString()}</p>
                      <Badge variant="default" className="mt-1">
                        {inspection.result}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
