import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { useVehicle, useVehicleTasks, useInspections } from "@/hooks/useVehicles";

export default function VehicleDetail() {
  const { id } = useParams();
  const { data: vehicle, isLoading } = useVehicle(id || "");
  const { data: tasks } = useVehicleTasks(id || "");
  const { data: inspections } = useInspections(id || "");

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!vehicle) return <div className="space-y-6"><Link to="/fleet"><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link><Card><CardContent className="py-12 text-center"><AlertTriangle className="h-12 w-12 text-destructive mb-4 mx-auto" /><p className="text-lg font-medium">Vehicle not found</p></CardContent></Card></div>;

  return (
    <div className="space-y-6">
      <Link to="/fleet"><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" />Back to Fleet</Button></Link>
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">{vehicle.vehicle_id}</h1><p className="text-muted-foreground">{vehicle.year} {vehicle.make} {vehicle.model}</p></div>
        <Badge variant="secondary">{vehicle.status}</Badge>
      </div>
      <Card><CardHeader><CardTitle>Vehicle Information</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div><p className="text-sm text-muted-foreground">VIN</p><p className="font-medium">{vehicle.vin}</p></div><div><p className="text-sm text-muted-foreground">Plate</p><p className="font-medium">{vehicle.plate}</p></div><div><p className="text-sm text-muted-foreground">Type</p><p className="font-medium">{vehicle.type}</p></div><div><p className="text-sm text-muted-foreground">Region</p><p className="font-medium">{vehicle.regions?.code}</p></div></div></CardContent></Card>
      <Tabs defaultValue="tasks"><TabsList><TabsTrigger value="tasks">Tasks</TabsTrigger><TabsTrigger value="inspections">Inspections</TabsTrigger></TabsList><TabsContent value="tasks"><Card><CardHeader><CardTitle>Tasks</CardTitle></CardHeader><CardContent>{(tasks || []).length === 0 ? <p className="text-center py-8 text-muted-foreground">No tasks</p> : <div className="space-y-3">{(tasks || []).map(t => <div key={t.id} className="p-4 border rounded-lg"><div className="flex justify-between"><h4 className="font-medium">{t.step_name}</h4><Badge>{t.status}</Badge></div><p className="text-sm text-muted-foreground">{t.step_category}</p></div>)}</div>}</CardContent></Card></TabsContent><TabsContent value="inspections"><Card><CardHeader><CardTitle>Inspections</CardTitle></CardHeader><CardContent>{(inspections || []).length === 0 ? <p className="text-center py-8 text-muted-foreground">No inspections</p> : <div className="space-y-3">{(inspections || []).map(i => <div key={i.id} className="p-4 border rounded-lg flex justify-between"><div><h4 className="font-medium">{i.type}</h4><p className="text-sm text-muted-foreground">{i.inspector}</p></div><Badge>{i.result}</Badge></div>)}</div>}</CardContent></Card></TabsContent></Tabs>
    </div>
  );
}
