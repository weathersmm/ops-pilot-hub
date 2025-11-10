import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { sanitizeCsvCell, vehicleTypeEnum, vehicleStatusEnum, taskStepCategoryEnum } from "@/lib/validation";
import { Database } from "@/integrations/supabase/types";

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
      const values = line.split(',').map(v => sanitizeCsvCell(v));
      return headers.reduce((obj, header, idx) => {
        obj[header] = values[idx] || '';
        return obj;
      }, {} as Record<string, string>);
    });
  };

  // Zod schemas for validation
  const taskTemplateSchema = z.object({
    TemplateId: z.string().trim().min(1).max(100),
    Name: z.string().trim().min(1).max(200),
    VehicleType: vehicleTypeEnum,
    StepOrder: z.string().regex(/^\d+$/).transform(val => {
      const num = parseInt(val);
      if (isNaN(num) || num < 0) throw new Error('Invalid step order');
      return num;
    }),
    StepName: z.string().trim().min(1).max(200),
    StepCategory: taskStepCategoryEnum,
    SLAHours: z.string().regex(/^\d+$/).transform(val => {
      const num = parseInt(val);
      if (isNaN(num) || num < 1 || num > 720) throw new Error('SLA hours must be 1-720');
      return num;
    }).optional(),
    RequiresApproval: z.string().transform(val => val.toLowerCase() === 'true'),
    RequiresEvidence: z.string().transform(val => val.toLowerCase() === 'true'),
    EvidenceType: z.string().trim().max(50).optional(),
    DependentStepId: z.string().trim().max(100).optional()
  });

  const vehicleSchema = z.object({
    VehicleId: z.string().trim().min(1).max(50),
    VIN: z.string().trim().length(17),
    Year: z.string().regex(/^\d{4}$/).transform(val => {
      const num = parseInt(val);
      if (isNaN(num) || num < 1900 || num > 2100) throw new Error('Invalid year');
      return num;
    }),
    Make: z.string().trim().min(1).max(100),
    Model: z.string().trim().min(1).max(100),
    Plate: z.string().trim().min(1).max(20),
    Type: vehicleTypeEnum,
    Status: vehicleStatusEnum.optional()
  });

  const importTaskTemplates = async (file: File) => {
    setLoading(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      const text = await file.text();
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }
      
      const rows = parseCSV(text);
      
      // Validate row count (max 1000 rows)
      if (rows.length > 1000) {
        throw new Error('File exceeds 1000 row limit');
      }

      // Optimized: Validate all rows first, then batch insert
      const validatedRows: Array<{
        template_id: string;
        name: string;
        region_id: null;
        vehicle_type: Database["public"]["Enums"]["vehicle_type"];
        step_order: number;
        step_name: string;
        step_category: Database["public"]["Enums"]["task_category"];
        sla_hours: number;
        requires_evidence: boolean;
        requires_approval: boolean;
        evidence_type: string | null;
        dependent_step_id: string | null;
      }> = [];

      // Validate all rows
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const validated = taskTemplateSchema.parse(row);
          validatedRows.push({
            template_id: validated.TemplateId,
            name: validated.Name,
            region_id: null,
            vehicle_type: validated.VehicleType as Database["public"]["Enums"]["vehicle_type"],
            step_order: validated.StepOrder,
            step_name: validated.StepName,
            step_category: validated.StepCategory as Database["public"]["Enums"]["task_category"],
            sla_hours: validated.SLAHours || 24,
            requires_evidence: validated.RequiresEvidence,
            requires_approval: validated.RequiresApproval,
            evidence_type: validated.EvidenceType || null,
            dependent_step_id: validated.DependentStepId || null
          });
        } catch (err) {
          const errorMsg = err instanceof z.ZodError 
            ? err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
            : err instanceof Error ? err.message : 'Unknown error';
          errors.push(`Row ${i + 1}: ${errorMsg}`);
        }
      }

      // Batch insert: Process in chunks of 100 for better performance
      const BATCH_SIZE = 100;
      for (let i = 0; i < validatedRows.length; i += BATCH_SIZE) {
        const batch = validatedRows.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from("task_templates")
          .insert(batch);

        if (error) {
          errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
        } else {
          successCount += batch.length;
        }
      }

      setResults({ type: 'Task Templates', success: successCount, errors });
      toast({
        title: "Import complete",
        description: `Imported ${successCount} task template steps`,
      });
    } catch (error: unknown) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : 'Unknown error',
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
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }
      
      const rows = parseCSV(text);
      
      // Validate row count (max 1000 rows)
      if (rows.length > 1000) {
        throw new Error('File exceeds 1000 row limit');
      }

      // Get region mapping once before processing
      const { data: regions } = await supabase.from("regions").select("id, code");
      const regionMap = new Map(regions?.map(r => [r.code, r.id]) || []);

      // Optimized: Validate all rows first, then batch insert
      const validatedRows: Array<{
        vehicle_id: string;
        vin: string;
        plate: string;
        make: string;
        model: string;
        year: number;
        type: Database["public"]["Enums"]["vehicle_type"];
        region_id: string | null;
        status: Database["public"]["Enums"]["vehicle_status"];
        commissioning_template: string | null;
        odometer: number;
        fuel_type: string | null;
        in_service_date: string | null;
        primary_depot: string | null;
        radio_id: string | null;
        lytx_id: string | null;
        last_chp_inspection: string | null;
        next_chp_inspection: string | null;
      }> = [];

      // Validate all rows
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const validated = vehicleSchema.parse(row);
          validatedRows.push({
            vehicle_id: validated.VehicleId,
            vin: validated.VIN,
            plate: validated.Plate,
            make: validated.Make,
            model: validated.Model,
            year: validated.Year,
            type: validated.Type as Database["public"]["Enums"]["vehicle_type"],
            region_id: regionMap.get(row.Region) || null,
            status: (validated.Status || 'Draft') as Database["public"]["Enums"]["vehicle_status"],
            commissioning_template: row.CommissioningTemplate || null,
            odometer: parseInt(row.Odometer || '0') || 0,
            fuel_type: row.FuelType || null,
            in_service_date: row.InServiceDate || null,
            primary_depot: row.PrimaryDepot || null,
            radio_id: row.RadioId || null,
            lytx_id: row.LytxId || null,
            last_chp_inspection: row.LastCHPInspection || null,
            next_chp_inspection: row.NextCHPInspection || null
          });
        } catch (err) {
          const errorMsg = err instanceof z.ZodError 
            ? err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
            : err instanceof Error ? err.message : 'Unknown error';
          errors.push(`Row ${i + 1}: ${errorMsg}`);
        }
      }

      // Batch insert: Process in chunks of 100 for better performance
      const BATCH_SIZE = 100;
      for (let i = 0; i < validatedRows.length; i += BATCH_SIZE) {
        const batch = validatedRows.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from("vehicles")
          .insert(batch);

        if (error) {
          errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
        } else {
          successCount += batch.length;
        }
      }

      setResults({ type: 'Vehicles', success: successCount, errors });
      toast({
        title: "Import complete",
        description: `Imported ${successCount} vehicles`,
      });
    } catch (error: unknown) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : 'Unknown error',
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
