
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

    // Build both cart and search URLs for testing
    const cartUrl = `https://www.spaceship.com/domain-registration?search=${encodeURIComponent(domain)}`;
    const searchUrl = `https://www.spaceship.com/domain-search?query=${encodeURIComponent(domain)}`;
    
    // Try cart URL first using GET for better CDN compatibility
    try {
      const response = await fetch(cartUrl, {
        method: 'GET',
        redirect: 'follow'
      });
      
      if (response.status === 404) {
        // Cart URL failed, try search URL as fallback
        try {
          const searchResponse = await fetch(searchUrl, { method: 'GET', redirect: 'follow' });
          
          // Treat 2xx and 3xx as success for search URL
          if (searchResponse.ok || (searchResponse.status >= 300 && searchResponse.status < 400)) {
            // Search URL works, use it instead
            return new Response(
              JSON.stringify({ ok: true, url: searchUrl }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
          }
        } catch (searchError) {
          console.log('Search URL also failed:', searchError);
        }
        
        // Both URLs failed - log and return failure
        await logValidation(supabaseService, domain, 'buy_link', '404', 
          `Both cart and search URLs returned 404: ${cartUrl}, ${searchUrl}`);
        
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
      
      // Treat 2xx and 3xx as success for cart URL
      if (!response.ok && !(response.status >= 300 && response.status < 400)) {
        // Log HTTP errors (but allow redirects)
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
