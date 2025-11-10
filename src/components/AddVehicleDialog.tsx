import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const vehicleFormSchema = z.object({
  vehicle_id: z.string().trim().min(1, "Vehicle ID is required").max(50, "Vehicle ID must be less than 50 characters"),
  vin: z.string().trim().length(17, "VIN must be exactly 17 characters").regex(/^[A-HJ-NPR-Z0-9]+$/i, "VIN contains invalid characters"),
  plate: z.string().trim().min(1, "License plate is required").max(20, "License plate must be less than 20 characters"),
  make: z.string().trim().min(1, "Make is required").max(100, "Make must be less than 100 characters"),
  model: z.string().trim().min(1, "Model is required").max(100, "Model must be less than 100 characters"),
  year: z.number().int("Year must be a whole number").min(1900, "Year must be 1900 or later").max(2100, "Year must be 2100 or earlier"),
  type: z.enum(["ALS", "BLS", "CCT", "Supervisor", "Other"]),
  region_id: z.string().min(1, "Region is required").uuid("Invalid region selected"),
});

interface AddVehicleDialogProps {
  regions: Array<{ id: string; code: string; name: string }>;
}

export default function AddVehicleDialog({ regions }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    vehicle_id: "",
    vin: "",
    plate: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    type: "ALS",
    region_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validation = vehicleFormSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Validation error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("vehicles").insert([{
        vehicle_id: formData.vehicle_id,
        vin: formData.vin,
        plate: formData.plate,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        type: formData.type as any,
        region_id: formData.region_id || null,
        status: "Draft" as any,
        created_by: user?.id || null,
      }]);

      if (error) throw error;

      toast({
        title: "Vehicle added",
        description: `${formData.vehicle_id} has been added successfully.`,
      });

      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setOpen(false);
      setFormData({
        vehicle_id: "",
        vin: "",
        plate: "",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        type: "ALS",
        region_id: "",
      });
    } catch (error: any) {
      toast({
        title: "Error adding vehicle",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>Enter vehicle details to add to the fleet</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Vehicle ID *</Label>
              <Input
                id="vehicle_id"
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                placeholder="E450-OC-1023"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">VIN *</Label>
              <Input
                id="vin"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                placeholder="1FDXE45P84HB12345"
                maxLength={17}
                required
              />
              <p className="text-xs text-muted-foreground">Must be exactly 17 characters</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plate">License Plate *</Label>
              <Input
                id="plate"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                placeholder="AMB-1023"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                min={1900}
                max={2100}
                required
              />
              <p className="text-xs text-muted-foreground">Between 1900 and 2100</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="Ford"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="E-450"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Vehicle Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALS">ALS</SelectItem>
                  <SelectItem value="BLS">BLS</SelectItem>
                  <SelectItem value="CCT">CCT</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select
                value={formData.region_id}
                onValueChange={(value) => setFormData({ ...formData, region_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.code} - {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Vehicle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
