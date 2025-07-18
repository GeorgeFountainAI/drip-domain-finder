import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DEPLOY-PRODUCTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Deploy to production function started");

    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user is admin
    const adminUsers = (Deno.env.get("ADMIN_USERS") || "").split(",").map(email => email.trim());
    const isAdmin = adminUsers.includes(user.email);
    
    logStep("Admin check", { userEmail: user.email, isAdmin });
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Access denied. Admin privileges required for deployment." }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { commit_hash, commit_message, deployed_by } = await req.json();
    logStep("Deployment request", { commit_hash, commit_message, deployed_by });

    // Trigger GitHub Actions workflow for production deployment
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    const githubRepo = Deno.env.get("GITHUB_REPO"); // Format: "owner/repo"
    
    if (!githubToken || !githubRepo) {
      logStep("GitHub configuration missing", { hasToken: !!githubToken, hasRepo: !!githubRepo });
      throw new Error("GitHub configuration not properly set up");
    }

    // Trigger GitHub Actions workflow
    const workflowDispatchUrl = `https://api.github.com/repos/${githubRepo}/actions/workflows/deploy.yml/dispatches`;
    
    const githubResponse = await fetch(workflowDispatchUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          deploy_to_production: "true",
          commit_hash: commit_hash || "",
          commit_message: commit_message || "",
          deployed_by: deployed_by || ""
        }
      })
    });

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text();
      logStep("GitHub API error", { status: githubResponse.status, error: errorText });
      throw new Error(`Failed to trigger GitHub Actions: ${githubResponse.status} - ${errorText}`);
    }

    logStep("GitHub Actions workflow triggered successfully");

    // Send Slack notification if configured
    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    if (slackWebhookUrl) {
      logStep("Sending Slack notification");
      
      try {
        const slackMessage = {
          text: "🚀 Production Deployment Initiated",
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "🚀 Production Deployment - Go/No-Go Decision Required"
              }
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Commit:* \`${commit_hash}\``
                },
                {
                  type: "mrkdwn", 
                  text: `*Initiated by:* ${deployed_by}`
                },
                {
                  type: "mrkdwn",
                  text: `*Message:* ${commit_message}`
                },
                {
                  type: "mrkdwn",
                  text: `*Time:* ${new Date().toISOString()}`
                }
              ]
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "✅ Go - Deploy to Production"
                  },
                  style: "primary",
                  action_id: "deploy_to_production",
                  value: JSON.stringify({ commit_hash, commit_message, deployed_by })
                },
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "🛑 No-Go - Hold Deployment"
                  },
                  style: "danger",
                  action_id: "hold_deployment",
                  value: JSON.stringify({ commit_hash, commit_message, deployed_by })
                }
              ]
            }
          ]
        };

        const slackResponse = await fetch(slackWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(slackMessage)
        });

        if (slackResponse.ok) {
          logStep("Slack notification sent successfully");
        } else {
          logStep("Slack notification failed", { status: slackResponse.status });
        }
      } catch (slackError) {
        logStep("Slack notification error", { error: slackError });
        // Don't fail the entire deployment if Slack fails
      }
    }

    // Return success response
    const responseData = {
      success: true,
      message: "Production deployment initiated successfully",
      workflow_triggered: true,
      slack_notified: !!slackWebhookUrl,
      commit_hash,
      deployed_by
    };

    logStep("Deployment initiation completed", responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in deploy-to-production", { message: errorMessage });
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});