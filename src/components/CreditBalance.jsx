
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Coins, TrendingUp } from 'lucide-react';

const CreditBalance = () => {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditBalance();
    
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
          fetchCreditBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCreditBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCredits({ current_credits: 0, total_purchased_credits: 0 });
        setLoading(false);
        return;
      }

      // First try to get existing credits
      let { data, error } = await supabase
        .from('user_credits')
        .select('current_credits, total_purchased_credits')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching credits:', error);
      }

      // If no record exists, ensure user gets starter credits
      if (!data) {
        try {
          const { data: onboardingResult } = await supabase.functions.invoke('user-onboarding');
          if (onboardingResult?.current_credits !== undefined) {
            setCredits({
              current_credits: onboardingResult.current_credits,
              total_purchased_credits: 0
            });
          } else {
            // Fallback to 10 credits if onboarding fails
            setCredits({ current_credits: 10, total_purchased_credits: 0 });
          }
        } catch (onboardingError) {
          console.warn('Onboarding function failed, using fallback credits:', onboardingError);
          setCredits({ current_credits: 10, total_purchased_credits: 0 });
        }
      } else {
        setCredits(data);
      }
    } catch (error) {
      console.error('Error:', error);
      // Fallback to show 10 credits if all else fails
      setCredits({ current_credits: 10, total_purchased_credits: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary mb-2">
          {credits?.current_credits || 10}
          <span className="text-sm font-normal text-muted-foreground ml-1">credits</span>
        </div>
        {credits?.total_purchased_credits > 0 && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{credits.total_purchased_credits} total purchased</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditBalance;
