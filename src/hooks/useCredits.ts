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

      try {
        // Use the new function to ensure starter credits
        const { data: starterResult, error: starterError } = await supabase.rpc(
          'ensure_user_starter_credits',
          { target_user_id: user.id }
        );

        if (starterError) {
          console.warn('Error ensuring starter credits, using fallback:', starterError);
          // Fallback: Create basic user credits record with default 20 credits
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('user_credits')
            .upsert({ 
              user_id: user.id, 
              current_credits: 20, 
              total_purchased_credits: 0 
            }, { 
              onConflict: 'user_id' 
            })
            .select('current_credits, total_purchased_credits')
            .single();

          if (fallbackError) {
            console.warn('Fallback also failed, using default values:', fallbackError);
            setCredits({ current_credits: 20, total_purchased_credits: 0 });
            setError(null); // Clear error as we have fallback values
            return;
          }
          
          setCredits(fallbackData);
          setError(null);
          return;
        }

        // Fetch the actual credits data
        const { data, error } = await supabase
          .from('user_credits')
          .select('current_credits, total_purchased_credits')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to handle missing records gracefully

        if (error) {
          console.warn('Error fetching credits, using fallback:', error);
          setCredits({ current_credits: 20, total_purchased_credits: 0 });
          setError(null);
          return;
        }

        if (!data) {
          // No credits record found, use default
          setCredits({ current_credits: 20, total_purchased_credits: 0 });
          setError(null);
          return;
        }

        setCredits(data);
        setError(null);
      } catch (apiError) {
        console.warn('API call failed, using fallback credits:', apiError);
        setCredits({ current_credits: 20, total_purchased_credits: 0 });
        setError(null);
      }
    } catch (err) {
      console.warn('Authentication or network error, using fallback:', err);
      setCredits({ current_credits: 20, total_purchased_credits: 0 });
      setError(null);
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