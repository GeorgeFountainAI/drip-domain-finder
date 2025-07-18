import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useConsumeCredit = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const consumeCredit = async (creditsToConsume = 1) => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to use credits",
          variant: "destructive",
        });
        return { success: false, error: 'User not authenticated' };
      }

      // Get current credits
      const { data: currentCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select('current_credits')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching credits:', fetchError);
        toast({
          title: "Error",
          description: "Failed to check credit balance",
          variant: "destructive",
        });
        return { success: false, error: fetchError.message };
      }

      const availableCredits = currentCredits?.current_credits || 0;

      // Check if user has enough credits
      if (availableCredits < creditsToConsume) {
        toast({
          title: "⚠️ Insufficient Credits",
          description: `You need ${creditsToConsume} credit${creditsToConsume > 1 ? 's' : ''} to proceed but only have ${availableCredits}`,
          variant: "insufficient-credits",
          duration: 6000,
          action: (
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openCreditPurchase'));
              }}
              className="bg-white text-orange-600 hover:bg-gray-100 font-medium px-3 py-1 rounded text-sm transition-colors"
            >
              Buy Credits
            </button>
          ),
        });
        return { 
          success: false, 
          error: 'Insufficient credits',
          availableCredits,
          requiredCredits: creditsToConsume
        };
      }

      // Deduct credits
      const newCreditBalance = availableCredits - creditsToConsume;
      const { data, error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          current_credits: newCreditBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select();

      if (updateError) {
        console.error('Error updating credits:', updateError);
        toast({
          title: "Error",
          description: "Failed to deduct credits",
          variant: "destructive",
        });
        return { success: false, error: updateError.message };
      }

      toast({
        title: "Credits Used",
        description: `${creditsToConsume} credit${creditsToConsume > 1 ? 's' : ''} deducted. Remaining: ${newCreditBalance}`,
      });

      return { 
        success: true, 
        newBalance: newCreditBalance,
        creditsConsumed: creditsToConsume
      };

    } catch (error) {
      console.error('Error consuming credit:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    consumeCredit,
    loading
  };
};