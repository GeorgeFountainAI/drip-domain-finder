import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useConsumeCreditRPC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const consumeCredits = async (
    required: number, 
    reason: string, 
    meta?: Record<string, any>
  ): Promise<number> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('consume_credits', {
        required,
        reason,
        meta: meta ? JSON.stringify(meta) : '{}'
      });

      if (error) {
        // Check if this is an insufficient credits error
        if (error.message.includes('insufficient_credits')) {
          throw new Error('insufficient_credits');
        }
        throw new Error(error.message);
      }

      // Success toast
      toast({
        title: "Credits deducted",
        description: `${required} credits used. ${data} remaining.`,
        duration: 2000,
      });

      return data; // Returns new balance
    } catch (error) {
      if (error instanceof Error && error.message === 'insufficient_credits') {
        // Don't show toast here, let the component handle it
        throw error;
      }
      
      // Other errors
      toast({
        title: "Error",
        description: "Failed to process credits. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    consumeCredits,
    loading
  };
};
