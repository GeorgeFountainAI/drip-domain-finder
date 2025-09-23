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
    // Initialize Supabase client for auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log("Creating checkout session for user:", user.id);

    // Get request body
    const { packId } = await req.json();
    
    // Single credit package configuration - $5 = 10 credits
    const CREDIT_PACKS = [
      {
        id: 'pack_10',
        name: '10 Credits',
        priceUsd: 5,
        credits: 10,
        stripePriceId: Deno.env.get('STRIPE_PRICE_ID_5_USD') || 'price_1QVhBzGzNKcEgtoG5JK0c1FJVTKKBDNRjyN7o6fZWNPB2nNBb0MvbB8l0kA0kFJq00qBJ3KOmx'
      }
    ];

    const selectedPackage = CREDIT_PACKS.find(pack => pack.id === packId);
    if (!selectedPackage) {
      throw new Error(`Invalid credit package: ${packId}`);
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
        line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: selectedPackage.name,
              description: `Purchase ${selectedPackage.credits} credits for your account`,
            },
            unit_amount: selectedPackage.priceUsd * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/app?payment=success`,
      cancel_url: `${req.headers.get("origin")}/app?payment=cancelled`,
      metadata: {
        user_id: user.id,
        credits: selectedPackage.credits.toString(),
        package: packId,
      },
    });

    console.log("Stripe session created:", session.id);

    // Store purchase record in Supabase with service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabaseService
      .from("credit_purchases")
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        credits: selectedPackage.credits,
        amount: selectedPackage.priceUsd * 100, // Store in cents
        status: "pending",
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error("Error inserting purchase record:", insertError);
      throw new Error("Failed to create purchase record");
    }

    console.log("Purchase record created successfully");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});