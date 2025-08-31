import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin access through Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Check if user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseService.auth.getUser(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const { data: profile } = await supabaseService
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }

    // List of known problematic domains to flag
    const flaggedDomains = [
      'hub.com', 'shift.com', 'lab.com', 'scope.com',
      'hub.net', 'shift.net', 'lab.net', 'scope.net',
      'hub.org', 'shift.org', 'lab.org', 'scope.org'
    ];

    // Add informative entries to validation_logs for each flagged domain
    const logEntries = flaggedDomains.map(domain => ({
      domain,
      source: 'admin-patch',
      status: 'blocked',
      message: `Domain blocked retroactively - known to be misleading or problematic`,
      created_at: new Date().toISOString()
    }));

    const { error: insertError } = await supabaseService
      .from('validation_logs')
      .insert(logEntries);

    if (insertError) {
      console.error('Failed to insert log entries:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to patch logs' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log(`Successfully patched ${flaggedDomains.length} domains in validation logs`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        patched_domains: flaggedDomains.length,
        message: 'Historical logs patched successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Patch historical logs error:', error);
    return new Response(
      JSON.stringify({ error: 'Patch operation failed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});