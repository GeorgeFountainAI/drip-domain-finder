import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCredits = () => {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCredits(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_credits')
        .select('current_credits, total_purchased_credits')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching credits:', error);
        setError(error);
        return;
      }

      setCredits(data || { current_credits: 0, total_purchased_credits: 0 });
    } catch (err) {
      console.error('Error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const hasCredits = (requiredCredits = 1) => {
    return credits?.current_credits >= requiredCredits;
  };

  return {
    credits: credits?.current_credits || 0,
    totalPurchased: credits?.total_purchased_credits || 0,
    loading,
    error,
    hasCredits,
    refetch: fetchCredits
  };
};