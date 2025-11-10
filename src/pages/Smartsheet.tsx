import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileSpreadsheet, RefreshCw, Loader2, CheckSquare, Download, Database, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useSmartsheetSync } from "@/hooks/useSmartsheetSync";
import { exportToCSV } from "@/utils/csvExport";

interface SmartsheetSheet {
  id: string;
  name: string;
  accessLevel?: string;
  permalink?: string;
  modifiedAt?: string;
}

interface SheetColumn {
  id: string;
  title: string;
}

interface SheetCell {
  displayValue?: string;
  value?: string;
}

interface SheetRow {
  id: string;
  cells?: SheetCell[];
}

interface SheetDataDetails {
  name: string;
  columns: SheetColumn[];
  rows: SheetRow[];
  modifiedAt?: string;
}

interface SheetData {
  sheetId: string;
  data: SheetDataDetails | null;
  error: string | null;
}

export default function Smartsheet() {
  const [availableSheets, setAvailableSheets] = useState<SmartsheetSheet[]>([]);
  const [selectedSheetIds, setSelectedSheetIds] = useState<string[]>([]);
  const [sheetData, setSheetData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const { toast } = useToast();
  const { configs, logs, addSyncConfig, toggleSync, manualSync, refreshLogs } = useSmartsheetSync();

  const loadAvailableSheets = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching available Smartsheet sheets...");
      
      const { data, error } = await supabase.functions.invoke('smartsheet', {
        body: { action: 'list' }
      });

      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log("Received sheets:", data);
      setAvailableSheets(data.data || []);
      
      toast({
        title: "Sheets loaded",
        description: `Found ${data.data?.length || 0} Smartsheet sheets`,
      });
    } catch (error: unknown) {
      console.error("Error loading sheets:", error);
      toast({
        title: "Error loading sheets",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAvailableSheets();
  }, [loadAvailableSheets]);

  const toggleSheetSelection = useCallback((sheetId: string) => {
    setSelectedSheetIds(prev => 
      prev.includes(sheetId) 
        ? prev.filter(id => id !== sheetId)
        : [...prev, sheetId]
    );
  }, []);

  const fetchSelectedSheets = async () => {
    if (selectedSheetIds.length === 0) {
      toast({
        title: "No sheets selected",
        description: "Please select at least one sheet to fetch data",
        variant: "destructive",
      });
      return;
    }

    setFetchingData(true);
    try {
      console.log("Fetching data for sheets:", selectedSheetIds);
      
      const { data, error } = await supabase.functions.invoke('smartsheet', {
        body: { 
          action: 'fetch',
          sheetIds: selectedSheetIds 
        }
      });

      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log("Received sheet data:", data);
      setSheetData(data.sheets || []);
      
      const successCount = data.sheets?.filter((s: SheetData) => !s.error).length || 0;
      toast({
        title: "Data fetched",
        description: `Successfully loaded ${successCount} of ${selectedSheetIds.length} sheets`,
      });
    } catch (error: unknown) {
      console.error("Error fetching sheet data:", error);
      toast({
        title: "Error fetching data",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setFetchingData(false);
    }
  };

  const handleExportCSV = (sheet: SheetData) => {
    if (sheet.data) {
      exportToCSV(sheet.data);
      toast({
        title: "Export complete",
        description: `Exported ${sheet.data.name} to CSV`,
      });
    }
  };

  const handleEnableSync = async (sheetId: string, sheetName: string) => {
    await addSyncConfig(sheetId, sheetName);
  };

  const renderSheetData = (sheet: SheetData) => {
    if (sheet.error) {
      return (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <p className="text-destructive">Error: {sheet.error}</p>
          </CardContent>
        </Card>
      );
    }

    if (!sheet.data) {
      return null;
    }

    const columns = sheet.data.columns || [];
    const rows = sheet.data.rows || [];
    const isSyncEnabled = configs.some(c => c.sheet_id === sheet.sheetId && c.sync_enabled);

    return (
      <Card key={sheet.sheetId}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                {sheet.data.name}
              </CardTitle>
              <CardDescription>
                {rows.length} rows · {columns.length} columns
                {sheet.data.modifiedAt && ` · Last modified: ${new Date(sheet.data.modifiedAt).toLocaleString()}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV(sheet)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              {!isSyncEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEnableSync(sheet.sheetId, sheet.data!.name)}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Enable Auto-Sync
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col: SheetColumn) => (
                    <TableHead key={col.id}>{col.title}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 50).map((row: SheetRow) => (
                  <TableRow key={row.id}>
                    {row.cells?.map((cell: SheetCell, idx: number) => (
                      <TableCell key={idx}>
                        {cell.displayValue || cell.value || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rows.length > 50 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Showing first 50 rows of {rows.length}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Smartsheet Integration</h1>
          <p className="text-muted-foreground">Pull live data from multiple Smartsheet sheets</p>
        </div>
        <Button onClick={loadAvailableSheets} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Sheets
        </Button>
      </div>

      <Tabs defaultValue="select">
        <TabsList>
          <TabsTrigger value="select">Select Sheets</TabsTrigger>
          <TabsTrigger value="data" disabled={sheetData.length === 0}>
            View Data ({sheetData.length})
          </TabsTrigger>
          <TabsTrigger value="sync">Auto-Sync ({configs.length})</TabsTrigger>
          <TabsTrigger value="history">Sync History</TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Sheets</CardTitle>
              <CardDescription>
                Select one or more sheets to fetch data from
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : availableSheets.length === 0 ? (
                <div className="text-center py-12">
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sheets found</p>
                  <Button onClick={loadAvailableSheets} className="mt-4">
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {availableSheets.map((sheet) => (
                      <div
                        key={sheet.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={sheet.id}
                          checked={selectedSheetIds.includes(sheet.id)}
                          onCheckedChange={() => toggleSheetSelection(sheet.id)}
                        />
                        <label
                          htmlFor={sheet.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{sheet.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {sheet.accessLevel && (
                              <Badge variant="outline" className="mr-2">
                                {sheet.accessLevel}
                              </Badge>
                            )}
                            {sheet.modifiedAt && `Modified: ${new Date(sheet.modifiedAt).toLocaleDateString()}`}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {selectedSheetIds.length > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        <CheckSquare className="h-4 w-4 inline mr-1" />
                        {selectedSheetIds.length} sheet{selectedSheetIds.length !== 1 ? 's' : ''} selected
                      </p>
                      <Button onClick={fetchSelectedSheets} disabled={fetchingData}>
                        {fetchingData ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Fetching...
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Fetch Data
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          {sheetData.map(renderSheetData)}
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Sync Configuration</CardTitle>
              <CardDescription>
                Configure sheets to sync automatically every 5 minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No auto-sync configured yet</p>
                  <p className="text-sm mt-2">Fetch sheets and enable auto-sync from the View Data tab</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {configs.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{config.sheet_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Sync every {config.sync_interval_minutes} minutes
                          {config.last_synced_at && (
                            <> · Last synced: {new Date(config.last_synced_at).toLocaleString()}</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {config.sync_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <Switch
                            checked={config.sync_enabled}
                            onCheckedChange={(checked) => toggleSync(config.id, checked)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => manualSync([config.sheet_id])}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                Recent automatic sync operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sync history yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sheet ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rows Synced</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.sheet_id}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.rows_synced ?? '-'}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(log.synced_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-destructive">
                          {log.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
