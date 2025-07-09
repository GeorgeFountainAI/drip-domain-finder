import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-DATA] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Admin data function started");

    // Use service role key to bypass RLS for admin queries
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    // Verify user authentication using anon key first
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data: userData, error: userError } = await anonClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user is admin
    const adminUsers = (Deno.env.get("ADMIN_USERS") || "").split(",").map(email => email.trim());
    const isAdmin = adminUsers.includes(user.email);
    
    logStep("Admin check", { userEmail: user.email, adminUsers, isAdmin });
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Access denied. Admin privileges required." }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { action } = await req.json();
    logStep("Admin action requested", { action });

    let responseData = {};

    switch (action) {
      case "getRecentSearches":
        logStep("Fetching recent searches");
        const { data: recentSearches, error: searchError } = await supabaseClient
          .from("search_history")
          .select(`
            id,
            keyword,
            created_at,
            user_id
          `)
          .order("created_at", { ascending: false })
          .limit(20);

        if (searchError) {
          logStep("Error fetching recent searches", { error: searchError });
          throw new Error(`Failed to fetch recent searches: ${searchError.message}`);
        }

        // Get user emails for the searches
        const userIds = [...new Set(recentSearches?.map(s => s.user_id) || [])];
        const { data: users, error: usersError } = await supabaseClient.auth.admin.listUsers();
        
        if (usersError) {
          logStep("Error fetching users", { error: usersError });
          throw new Error(`Failed to fetch users: ${usersError.message}`);
        }

        const userEmailMap = new Map();
        users.users.forEach(u => {
          if (u.id && u.email) {
            userEmailMap.set(u.id, u.email);
          }
        });

        const searchesWithEmails = recentSearches?.map(search => ({
          ...search,
          user_email: userEmailMap.get(search.user_id) || "Unknown"
        })) || [];

        responseData.recentSearches = searchesWithEmails;
        logStep("Recent searches fetched", { count: searchesWithEmails.length });
        break;

      case "getTopKeywords":
        logStep("Fetching top keywords");
        const { data: topKeywords, error: keywordsError } = await supabaseClient
          .from("search_history")
          .select("keyword")
          .order("created_at", { ascending: false })
          .limit(1000); // Get recent 1000 searches for analysis

        if (keywordsError) {
          logStep("Error fetching keywords", { error: keywordsError });
          throw new Error(`Failed to fetch keywords: ${keywordsError.message}`);
        }

        // Count keyword frequency
        const keywordCounts = new Map();
        topKeywords?.forEach(item => {
          const keyword = item.keyword.toLowerCase().trim();
          keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
        });

        // Sort by frequency and get top 5
        const sortedKeywords = Array.from(keywordCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([keyword, count]) => ({ keyword, count }));

        responseData.topKeywords = sortedKeywords;
        logStep("Top keywords calculated", { count: sortedKeywords.length });
        break;

      case "getStats":
        logStep("Fetching general stats");
        
        // Total searches
        const { count: totalSearches, error: countError } = await supabaseClient
          .from("search_history")
          .select("*", { count: "exact", head: true });

        if (countError) {
          logStep("Error fetching search count", { error: countError });
          throw new Error(`Failed to fetch search count: ${countError.message}`);
        }

        // Searches today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: todaySearches, error: todayError } = await supabaseClient
          .from("search_history")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString());

        if (todayError) {
          logStep("Error fetching today's search count", { error: todayError });
          throw new Error(`Failed to fetch today's search count: ${todayError.message}`);
        }

        // Unique users
        const { data: uniqueUsers, error: uniqueError } = await supabaseClient
          .from("search_history")
          .select("user_id", { distinct: true });

        if (uniqueError) {
          logStep("Error fetching unique users", { error: uniqueError });
          throw new Error(`Failed to fetch unique users: ${uniqueError.message}`);
        }

        responseData.stats = {
          totalSearches: totalSearches || 0,
          todaySearches: todaySearches || 0,
          uniqueUsers: uniqueUsers?.length || 0
        };
        logStep("Stats calculated", responseData.stats);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in admin-data", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});