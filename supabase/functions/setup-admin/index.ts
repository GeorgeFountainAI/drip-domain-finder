import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SETTINGS_TABLE = "settings";
const adminRows = (email: string) => ([
  { key: "admin_email", value: email, updated_at: new Date().toISOString() },
  { key: "admin_setup_done", value: 1, updated_at: new Date().toISOString() },
  { key: "first_admin_configured", value: 1, updated_at: new Date().toISOString() },
]);

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
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response("Missing or invalid email", { status: 400 });
    }

    console.log('[SETUP-ADMIN] Setting up admin with email:', email);

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    for (const row of adminRows(email.trim().toLowerCase())) {
      console.log('[SETUP-ADMIN] Upserting row:', row);
      const { error } = await supabase.from(SETTINGS_TABLE).upsert(row, { onConflict: "key" });
      if (error) {
        console.error('[SETUP-ADMIN] Error upserting row:', error);
        throw error;
      }
    }

    console.log('[SETUP-ADMIN] Admin setup completed successfully');

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error('[SETUP-ADMIN] Error:', e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});