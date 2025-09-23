import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGetCreditBalance = () => {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: rpcError } = await supabase.rpc('get_credit_balance');
      
      if (rpcError) {
        throw new Error(rpcError.message);
      }
      
      // If user has 0 credits and this might be a broken account, try healing
      if (data === 0) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Try to heal broken account with 0 credits
            const { data: healResult, error: healError } = await supabase.rpc('ensure_user_starter_credits', { 
              target_user_id: user.id 
            });
            
            if (!healError && healResult && typeof healResult === 'object') {
              const result = healResult as { healed?: boolean; current_credits?: number };
              if (result.healed) {
                console.log('Healed user account with 0 credits:', healResult);
                setCredits(result.current_credits || 0);
                return;
              }
            }
          }
        } catch (healError) {
          console.warn('Could not attempt healing:', healError);
        }
      }
      
      setCredits(data || 0);
    } catch (err) {
      console.error('Error fetching credit balance:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Don't set credits to 0 on error, keep existing value
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
    
    // Set up real-time subscription for credit updates
    const channel = supabase
      .channel('user-credits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits'
        },
        () => {
          fetchCredits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    credits,
    loading,
    error,
    refetch: fetchCredits
  };
};
