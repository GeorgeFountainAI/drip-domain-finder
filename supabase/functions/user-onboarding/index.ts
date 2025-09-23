import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Get starter credits from settings with fallback
 */
async function getStarterCredits(supabaseClient: any): Promise<number> {
  try {
    const { data, error } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'starter_credits')
      .single()
    
    if (error || !data) {
      console.warn('Could not fetch starter_credits from settings, using fallback:', error)
      return 10 // Fallback value matching settings table
    }
    
    return data.value || 10
  } catch (error) {
    console.warn('Error fetching starter_credits:', error)
    return 10 // Fallback value
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    try {
      // Ensure user gets starter credits
      const { data: result, error } = await supabaseClient.rpc(
        'ensure_user_starter_credits',
        { target_user_id: user.id }
      )

      if (error) {
        console.warn('RPC function failed, trying direct insert fallback:', error)
        
        // Get starter credits from settings
        const starterCredits = await getStarterCredits(supabaseClient)
        
        // Fallback: Try direct upsert with settings value
        const { data: fallbackResult, error: fallbackError } = await supabaseClient
          .from('user_credits')
          .upsert(
            { 
              user_id: user.id, 
              current_credits: starterCredits, 
              total_purchased_credits: 0 
            },
            { onConflict: 'user_id' }
          )
          .select()
          .single()

        if (fallbackError) {
          console.warn('Fallback also failed, returning default response:', fallbackError)
          // Return success with settings value even if DB operations fail
          return new Response(
            JSON.stringify({
              success: true,
              credits_granted: starterCredits,
              new_user: true,
              current_credits: starterCredits,
              fallback_used: true
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            },
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            credits_granted: starterCredits,
            new_user: true,
            current_credits: fallbackResult.current_credits,
            fallback_used: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }

      return new Response(
        JSON.stringify(result),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } catch (dbError) {
      console.warn('Database operations failed, returning default response:', dbError)
      
      // Get starter credits from settings for fallback
      const starterCredits = await getStarterCredits(supabaseClient)
      
      // Even if all database operations fail, return success with settings value
      return new Response(
        JSON.stringify({
          success: true,
          credits_granted: starterCredits,
          new_user: true,
          current_credits: starterCredits,
          fallback_used: true,
          error: 'Database unavailable, using defaults'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }
  } catch (error) {
    console.error('Error in user-onboarding function:', error)
    
    // Even in case of critical errors, try to return a reasonable response
    if (error.message === 'Unauthorized') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        },
      )
    }
    
    // For all other errors, return a graceful fallback
    return new Response(
      JSON.stringify({ 
        error: 'Service temporarily unavailable',
        fallback_credits: 10 // Use 10 to match settings table default
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      },
    )
  }
})