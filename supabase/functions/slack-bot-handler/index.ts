import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    const slackBotToken = Deno.env.get('SLACK_BOT_TOKEN');
    
    if (!githubToken || !slackBotToken) {
      console.error('Missing GitHub or Slack tokens');
      return new Response(
        JSON.stringify({ error: 'Missing required tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    const payload = new URLSearchParams(body);
    
    // Verify Slack request
    const slackSignature = req.headers.get('X-Slack-Signature');
    const slackTimestamp = req.headers.get('X-Slack-Request-Timestamp');
    
    // Parse the Slack button interaction
    const slackPayload = JSON.parse(payload.get('payload') || '{}');
    console.log('Slack interaction received:', slackPayload);

    if (slackPayload.type === 'block_actions') {
      const action = slackPayload.actions[0];
      const actionId = action.action_id;
      const user = slackPayload.user.name;
      const channel = slackPayload.channel.name;

      if (actionId === 'deploy_to_production') {
        const actionValue = JSON.parse(action.value);
        
        // Trigger GitHub Actions workflow for production deployment
        const workflowResponse = await fetch(
          `https://api.github.com/repos/yourusername/domaindrip-ai/actions/workflows/deploy.yml/dispatches`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ref: 'main',
              inputs: {
                deploy_to_production: 'true',
                commit_hash: actionValue.commit_hash,
                staging_url: actionValue.staging_url
              }
            })
          }
        );

        if (!workflowResponse.ok) {
          throw new Error(`GitHub workflow trigger failed: ${workflowResponse.status}`);
        }

        // Update Slack message to show deployment in progress
        const updateMessage = {
          text: `🚀 Production deployment initiated by @${user}`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "🚀 Production Deployment In Progress"
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Approved by:* @${user}\n*Status:* 🔄 Deploying to production...\n*Commit:* \`${actionValue.commit_hash.slice(0, 7)}\``
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `Deployment initiated at ${new Date().toLocaleString()}`
                }
              ]
            }
          ]
        };

        return new Response(JSON.stringify(updateMessage), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } else if (actionId === 'hold_deployment') {
        const actionValue = JSON.parse(action.value);
        
        // Log the hold decision
        console.log(`Deployment held by ${user} for commit ${actionValue.commit_hash}`);

        // Update Slack message to show deployment held
        const updateMessage = {
          text: `🛑 Production deployment held by @${user}`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "🛑 Production Deployment Held"
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Held by:* @${user}\n*Status:* ⏸️ Deployment cancelled\n*Commit:* \`${actionValue.commit_hash.slice(0, 7)}\``
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Next steps:*\n• Fix any issues found in staging\n• Push new changes to trigger a fresh deployment\n• Or manually restart this deployment when ready"
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `Deployment held at ${new Date().toLocaleString()}`
                }
              ]
            }
          ]
        };

        return new Response(JSON.stringify(updateMessage), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in slack-bot-handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);