import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Idempotent post-authentication setup that ensures user has:
 * 1. A profile record in public.profiles
 * 2. Starter credits in public.user_credits
 * 
 * This function can be called multiple times safely and will heal
 * any missing data from previous failed signups or inconsistent states.
 */
export async function ensureProfileAndCredits(user: User): Promise<void> {
  if (!user?.id || !user?.email) {
    throw new Error('Invalid user data');
  }

  try {
    // Upsert profile - this will create or update the profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        is_admin: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('Profile upsert failed:', profileError);
      // Don't throw - profile creation is handled by trigger, this is just insurance
    }

    // Ensure starter credits using the existing RPC function
    const { data: creditsResult, error: creditsError } = await supabase
      .rpc('ensure_user_starter_credits', { 
        target_user_id: user.id 
      });

    if (creditsError) {
      console.error('Credits RPC failed, trying fallback:', creditsError);
      
      // Fallback: direct upsert with safe default
      const { error: fallbackError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: user.id,
          current_credits: 20,
          total_purchased_credits: 0,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (fallbackError) {
        console.error('Credits fallback failed:', fallbackError);
        // Don't throw - credits will be handled by triggers
      }
    }

    if (import.meta.env.DEV && creditsResult) {
      console.log('Credits setup result:', creditsResult);
    }

  } catch (error) {
    console.error('Post-auth setup failed:', error);
    // Don't throw - let the app continue, triggers will handle the rest
  }
}