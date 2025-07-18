import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify the webhook signature (optional - you can set up endpoint secret later)
    let event;
    try {
      // For now, just parse the event directly
      event = JSON.parse(body);
    } catch (err) {
      console.error("Error parsing webhook body:", err);
      throw new Error("Invalid payload");
    }

    console.log("Received webhook event:", event.type);

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Processing completed session:", session.id);

      const userId = session.metadata.user_id;
      const credits = parseInt(session.metadata.credits);

      if (!userId || !credits) {
        console.error("Missing metadata in session:", session.metadata);
        throw new Error("Missing required metadata");
      }

      // Initialize Supabase with service role key
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      console.log("Calling complete_credit_purchase function...");

      // Call the Supabase function to complete the purchase
      const { data, error } = await supabase.rpc("complete_credit_purchase", {
        stripe_session_id: session.id,
        user_id: userId,
        credits: credits
      });

      if (error) {
        console.error("Error calling complete_credit_purchase:", error);
        throw new Error(`Failed to complete purchase: ${error.message}`);
      }

      console.log("Purchase completed successfully:", data);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});