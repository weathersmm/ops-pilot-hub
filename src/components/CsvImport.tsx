import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CsvImport() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{type: string; success: number; errors: string[]}>({
    type: "",
    success: 0,
    errors: []
  });
  const { toast } = useToast();

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj, header, idx) => {
        obj[header] = values[idx] || '';
        return obj;
      }, {} as Record<string, string>);
    });
  };

  const importTaskTemplates = async (file: File) => {
    setLoading(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      for (const row of rows) {
        try {
          const { error } = await supabase.from("task_templates").insert([{
            template_id: row.TemplateId,
            name: row.Name,
            region_id: null,
            vehicle_type: (row.VehicleType || 'ALS') as any,
            step_order: parseInt(row.StepOrder),
            step_name: row.StepName,
            step_category: row.StepCategory as any,
            sla_hours: parseInt(row.SLAHours),
            requires_evidence: row.RequiresEvidence === 'True',
            requires_approval: row.RequiresApproval === 'True',
            evidence_type: row.EvidenceType || null,
            dependent_step_id: row.DependentStepId || null
          }]);

          if (error) {
            errors.push(`Row ${row.StepOrder}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (err: any) {
          errors.push(`Row ${row.StepOrder}: ${err.message}`);
        }
      }

      setResults({ type: 'Task Templates', success: successCount, errors });
      toast({
        title: "Import complete",
        description: `Imported ${successCount} task template steps`,
      });
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const importVehicles = async (file: File) => {
    setLoading(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      // Get region mapping
      const { data: regions } = await supabase.from("regions").select("id, code");
      const regionMap = new Map(regions?.map(r => [r.code, r.id]) || []);

      for (const row of rows) {
        try {
          const { error } = await supabase.from("vehicles").insert([{
            vehicle_id: row.VehicleId,
            vin: row.VIN,
            plate: row.Plate || null,
            make: row.Make,
            model: row.Model,
            year: parseInt(row.Year) || new Date().getFullYear(),
            type: row.Type as any || 'Other',
            region_id: regionMap.get(row.Region) || null,
            status: row.Status as any || 'Draft',
            commissioning_template: row.CommissioningTemplate || null,
            odometer: parseInt(row.Odometer) || 0,
            fuel_type: row.FuelType || null,
            in_service_date: row.InServiceDate || null,
            primary_depot: row.PrimaryDepot || null,
            radio_id: row.RadioId || null,
            lytx_id: row.LytxId || null,
            last_chp_inspection: row.LastCHPInspection || null,
            next_chp_inspection: row.NextCHPInspection || null
          }]);

          if (error) {
            errors.push(`${row.VehicleId}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (err: any) {
          errors.push(`${row.VehicleId}: ${err.message}`);
        }
      }

      setResults({ type: 'Vehicles', success: successCount, errors });
      toast({
        title: "Import complete",
        description: `Imported ${successCount} vehicles`,
      });
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, importFn: (file: File) => Promise<void>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResults({ type: "", success: 0, errors: [] });
      importFn(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">CSV Data Import</h2>
        <p className="text-muted-foreground">Import vehicles, task templates, and workflow data</p>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Task Templates</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Import Task Templates</CardTitle>
              <CardDescription>Upload CSV file with commissioning workflow steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label htmlFor="templates-file">
                  <Button variant="outline" disabled={loading} asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {loading ? "Importing..." : "Choose File"}
                    </span>
                  </Button>
                </label>
                <input
                  id="templates-file"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, importTaskTemplates)}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Expected columns: TemplateId, Name, Region, VehicleType, StepOrder, StepName, StepCategory, SLAHours, RequiresEvidence, RequiresApproval, EvidenceType, DependentStepId
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Import Vehicles</CardTitle>
              <CardDescription>Upload CSV file with vehicle fleet data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label htmlFor="vehicles-file">
                  <Button variant="outline" disabled={loading} asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {loading ? "Importing..." : "Choose File"}
                    </span>
                  </Button>
                </label>
                <input
                  id="vehicles-file"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, importVehicles)}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Expected columns: VehicleId, VIN, Plate, Make, Model, Year, Type, Region, Status, CommissioningTemplate, Odometer, FuelType, InServiceDate, PrimaryDepot, RadioId, LytxId, LastCHPInspection, NextCHPInspection
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {results.success > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <p className="font-medium">{results.type}</p>
              <p className="text-green-600">Successfully imported: {results.success} records</p>
            </div>

            {results.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="font-medium">Errors ({results.errors.length})</p>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {results.errors.map((err, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">{err}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
