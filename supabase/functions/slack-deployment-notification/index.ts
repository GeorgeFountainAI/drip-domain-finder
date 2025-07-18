import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeploymentNotification {
  stage: 'staging' | 'production';
  status: 'success' | 'failure';
  app_url: string;
  commit_message: string;
  commit_hash: string;
  commit_author: string;
  branch: string;
  workflow_run_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    const slackBotToken = Deno.env.get('SLACK_BOT_TOKEN');
    
    if (!slackWebhookUrl || !slackBotToken) {
      console.error('Missing Slack configuration');
      return new Response(
        JSON.stringify({ error: 'Slack configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notification: DeploymentNotification = await req.json();
    console.log('Deployment notification received:', notification);

    let slackMessage;

    if (notification.stage === 'staging') {
      // 🎯 **THIS IS THE GO/NO-GO SLACK MESSAGE STRUCTURE TO REVIEW** 🎯
      slackMessage = {
        channel: "#releases",
        username: "DomainDrip Deploy Bot",
        icon_emoji: ":rocket:",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🚀 Staging Deployment Complete - Ready for Production Review"
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Status:* ${notification.status === 'success' ? '✅ Success' : '❌ Failed'}`
              },
              {
                type: "mrkdwn",
                text: `*Environment:* 🔧 Staging`
              },
              {
                type: "mrkdwn",
                text: `*Author:* ${notification.commit_author}`
              },
              {
                type: "mrkdwn",
                text: `*Branch:* ${notification.branch}`
              }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Latest Changes:*\n\`${notification.commit_hash.slice(0, 7)}\` ${notification.commit_message}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*🔗 Test the staging app:* <${notification.app_url}|DomainDrip.AI Staging>`
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*📋 Pre-Production Checklist:*\n• ✅ Build & tests passed\n• 🔍 Manual QA testing\n• 🎯 Domain search functionality\n• 💳 Credit system working\n• 🔐 Authentication flow\n• 📱 Mobile responsiveness"
            }
          },
          {
            type: "divider"
          },
          {
            type: "actions",
            block_id: "production_decision",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "🚀 Deploy to Production"
                },
                style: "primary",
                action_id: "deploy_to_production",
                value: JSON.stringify({
                  commit_hash: notification.commit_hash,
                  workflow_run_id: notification.workflow_run_id,
                  staging_url: notification.app_url
                })
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "🛑 Hold Deployment"
                },
                style: "danger",
                action_id: "hold_deployment",
                value: JSON.stringify({
                  commit_hash: notification.commit_hash,
                  workflow_run_id: notification.workflow_run_id
                })
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "📊 View Workflow"
                },
                action_id: "view_workflow",
                url: `https://github.com/yourusername/domaindrip-ai/actions/runs/${notification.workflow_run_id}`
              }
            ]
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Deployment ID: ${notification.workflow_run_id} | Commit: ${notification.commit_hash.slice(0, 7)} | ${new Date().toLocaleString()}`
              }
            ]
          }
        ]
      };
    } else if (notification.stage === 'production') {
      // Production success message
      slackMessage = {
        channel: "#releases",
        username: "DomainDrip Deploy Bot",
        icon_emoji: ":white_check_mark:",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🎉 Production Deployment Successful!"
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Status:* ✅ Live in Production`
              },
              {
                type: "mrkdwn",
                text: `*Deployed:* ${new Date().toLocaleString()}`
              }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*🌐 Live App:* <${notification.app_url}|DomainDrip.AI Production>`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Changes Deployed:*\n\`${notification.commit_hash.slice(0, 7)}\` ${notification.commit_message}`
            }
          }
        ]
      };
    }

    // Send to Slack
    const slackResponse = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${slackBotToken}`
      },
      body: JSON.stringify(slackMessage)
    });

    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      console.error('Slack webhook failed:', errorText);
      throw new Error(`Slack notification failed: ${slackResponse.status}`);
    }

    console.log('Slack notification sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${notification.stage} deployment notification sent`,
        slack_response: await slackResponse.text()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in slack-deployment-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);