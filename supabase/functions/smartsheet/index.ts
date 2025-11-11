import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SMARTSHEET_API_KEY = Deno.env.get('SMARTSHEET_API_KEY');
const SMARTSHEET_BASE_URL = 'https://api.smartsheet.com/2.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Input validation schema
const requestSchema = z.object({
  action: z.enum(['list', 'fetch', 'sync']),
  sheetIds: z.array(z.string()).max(50).optional()
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create authenticated Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check tenant type - only internal users allowed
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_type')
      .eq('id', user.id)
      .single();

    if (profile?.tenant_type !== 'internal') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Internal users only' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check role - only admin/supervisor allowed
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['admin', 'supervisor'].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin or Supervisor role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!SMARTSHEET_API_KEY) {
      throw new Error('SMARTSHEET_API_KEY is not configured');
    }

    // Validate request body
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request', 
          details: validation.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, sheetIds } = validation.data;

    console.log('Smartsheet request:', { action, sheetIds });

    // List all available sheets
    if (action === 'list') {
      const response = await fetch(`${SMARTSHEET_BASE_URL}/sheets`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SMARTSHEET_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Smartsheet API error:', response.status, error);
        throw new Error(`Smartsheet API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Retrieved sheets list:', data.data?.length || 0, 'sheets');
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sync data to database
    if (action === 'sync' && sheetIds && Array.isArray(sheetIds)) {
      let totalSynced = 0;
      
      for (const sheetId of sheetIds) {
        try {
          const response = await fetch(`${SMARTSHEET_BASE_URL}/sheets/${sheetId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${SMARTSHEET_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const error = await response.text();
            console.error(`Error fetching sheet ${sheetId}:`, response.status, error);
            
            await supabase.from('smartsheet_sync_log').insert({
              sheet_id: sheetId,
              status: 'error',
              error_message: `Failed to fetch: ${response.status}`
            });
            continue;
          }

          const data = await response.json();
          
          // Store each row in the database
          const rows = data.rows || [];
          for (const row of rows) {
            await supabase.from('smartsheet_data').upsert({
              sheet_id: sheetId,
              sheet_name: data.name,
              row_id: String(row.id),
              row_data: row,
              synced_at: new Date().toISOString()
            }, {
              onConflict: 'sheet_id,row_id'
            });
          }

          // Update sync config
          await supabase
            .from('smartsheet_sync_config')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('sheet_id', sheetId);

          // Log success
          await supabase.from('smartsheet_sync_log').insert({
            sheet_id: sheetId,
            status: 'success',
            rows_synced: rows.length
          });

          totalSynced += rows.length;
        } catch (error: unknown) {
          console.error(`Error syncing sheet ${sheetId}:`, error);
          await supabase.from('smartsheet_sync_log').insert({
            sheet_id: sheetId,
            status: 'error',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return new Response(JSON.stringify({ synced: totalSynced }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch data from multiple sheets
    if (action === 'fetch' && sheetIds && Array.isArray(sheetIds)) {
      const sheetDataPromises = sheetIds.map(async (sheetId) => {
        try {
          const response = await fetch(`${SMARTSHEET_BASE_URL}/sheets/${sheetId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${SMARTSHEET_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const error = await response.text();
            console.error(`Error fetching sheet ${sheetId}:`, response.status, error);
            return { 
              sheetId, 
              error: `Failed to fetch sheet: ${response.status}`,
              data: null 
            };
          }

          const data = await response.json();
          console.log(`Retrieved sheet ${sheetId}:`, data.name);
          
          return { 
            sheetId, 
            data,
            error: null 
          };
        } catch (error: unknown) {
          console.error(`Exception fetching sheet ${sheetId}:`, error);
          return { 
            sheetId, 
            error: error instanceof Error ? error.message : 'Unknown error',
            data: null 
          };
        }
      });

      const results = await Promise.all(sheetDataPromises);
      
      return new Response(JSON.stringify({ sheets: results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action or missing parameters');

  } catch (error: unknown) {
    console.error('Error in smartsheet function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
