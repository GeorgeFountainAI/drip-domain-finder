import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CreditsData {
  current_credits: number;
  total_purchased_credits: number;
}

export const useCredits = () => {
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

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
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCredits(null);
        setLoading(false);
        return;
      }

      // Use the new function to ensure starter credits
      const { data: starterResult, error: starterError } = await supabase.rpc(
        'ensure_user_starter_credits',
        { target_user_id: user.id }
      );

      if (starterError) {
        console.error('Error ensuring starter credits:', starterError);
        setError(starterError);
        setLoading(false);
        return;
      }

      // Fetch the actual credits data
      const { data, error } = await supabase
        .from('user_credits')
        .select('current_credits, total_purchased_credits')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        setError(error);
        return;
      }

      setCredits(data);
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