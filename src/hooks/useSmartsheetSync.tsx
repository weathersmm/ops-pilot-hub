import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SyncConfig {
  id: string;
  sheet_id: string;
  sheet_name: string;
  sync_enabled: boolean;
  sync_interval_minutes: number;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

interface SyncLog {
  id: string;
  sheet_id: string;
  status: string;
  rows_synced: number | null;
  error_message: string | null;
  synced_at: string;
}

export function useSmartsheetSync() {
  const [configs, setConfigs] = useState<SyncConfig[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadConfigs = async () => {
    const { data } = await supabase
      .from("smartsheet_sync_config" as any)
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setConfigs(data as unknown as SyncConfig[]);
  };

  const loadLogs = async () => {
    const { data } = await supabase
      .from("smartsheet_sync_log" as any)
      .select("*")
      .order("synced_at", { ascending: false })
      .limit(50);
    
    if (data) setLogs(data as unknown as SyncLog[]);
  };

  useEffect(() => {
    loadConfigs();
    loadLogs();
  }, []);

  const addSyncConfig = async (sheetId: string, sheetName: string) => {
    const { error } = await supabase
      .from("smartsheet_sync_config" as any)
      .insert({
        sheet_id: sheetId,
        sheet_name: sheetName,
        sync_enabled: true,
        sync_interval_minutes: 5
      } as any);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sync configured",
        description: `Auto-sync enabled for ${sheetName}`,
      });
      loadConfigs();
    }
  };

  const toggleSync = async (configId: string, enabled: boolean) => {
    const { error } = await supabase
      .from("smartsheet_sync_config" as any)
      .update({ sync_enabled: enabled } as any)
      .eq("id", configId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      loadConfigs();
    }
  };

  const manualSync = async (sheetIds: string[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smartsheet', {
        body: { 
          action: 'sync',
          sheetIds 
        }
      });

      if (error) throw error;

      toast({
        title: "Sync complete",
        description: `Synced ${data?.synced || 0} sheets`,
      });
      
      loadLogs();
    } catch (error: unknown) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    configs,
    logs,
    loading,
    addSyncConfig,
    toggleSync,
    manualSync,
    refreshConfigs: loadConfigs,
    refreshLogs: loadLogs
  };
}
