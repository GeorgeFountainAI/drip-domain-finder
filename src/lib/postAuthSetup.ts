import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Post-authentication setup that ensures user has:
 * 1. A profile record in public.profiles
 * 2. Starter credits via RPC function
 */
export async function ensureProfileAndCredits(user: User): Promise<void> {
  if (!user?.id || !user?.email) {
    throw new Error('Invalid user data');
  }

  try {
    // Upsert profile
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
    }

    // Ensure starter credits using RPC
    const { error: creditsError } = await supabase
      .rpc('ensure_user_starter_credits', { 
        target_user_id: user.id 
      });

    if (creditsError) {
      console.error('Credits RPC failed:', creditsError);
    }

  } catch (error) {
    console.error('Post-auth setup failed:', error);
  }
}
