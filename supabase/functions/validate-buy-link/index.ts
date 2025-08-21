
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();
    
    if (!domain) {
      return new Response(
        JSON.stringify({ error: 'Domain is required' }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Initialize Supabase service client for logging
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Build Spaceship cart URL
    const cartUrl = `https://www.spaceship.com/domain-registration?search=${encodeURIComponent(domain)}`;
    
    try {
      // Test if the cart URL is accessible
      const response = await fetch(cartUrl, {
        method: 'HEAD', // Just check headers, don't download content
        redirect: 'follow'
      });
      
      if (response.status === 404) {
        // Log 404 error
        await logValidation(supabaseService, domain, 'buy_link', '404', 
          `Cart URL returned 404: ${cartUrl}`);
        
        return new Response(
          JSON.stringify({ 
            ok: false, 
            error: '404',
            message: 'Buy link not accessible'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      
      if (!response.ok) {
        // Log other HTTP errors
        await logValidation(supabaseService, domain, 'buy_link', 'error', 
          `Cart URL returned ${response.status}: ${cartUrl}`);
        
        return new Response(
          JSON.stringify({ 
            ok: false, 
            error: response.status.toString(),
            message: 'Buy link returned error'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      
      // URL is accessible
      return new Response(
        JSON.stringify({ 
          ok: true, 
          url: cartUrl 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
      
    } catch (fetchError) {
      // Log network/fetch errors
      await logValidation(supabaseService, domain, 'buy_link', 'error', 
        `Cart URL fetch failed: ${fetchError.message}`);
      
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'fetch_failed',
          message: 'Unable to validate buy link'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

  } catch (error) {
    console.error('Validate buy link error:', error);
    return new Response(
      JSON.stringify({ error: 'Validation failed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function logValidation(supabaseService: any, domain: string, source: string, status: string, message: string) {
  try {
    await supabaseService
      .from('validation_logs')
      .insert({
        domain,
        source,
        status,
        message,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log validation:', error);
  }
}
