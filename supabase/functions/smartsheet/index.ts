import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SMARTSHEET_API_KEY = Deno.env.get('SMARTSHEET_API_KEY');
const SMARTSHEET_BASE_URL = 'https://api.smartsheet.com/2.0';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SMARTSHEET_API_KEY) {
      throw new Error('SMARTSHEET_API_KEY is not configured');
    }

    const { action, sheetIds } = await req.json();

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
