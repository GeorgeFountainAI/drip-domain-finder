import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type CheckResult = {
  status: 'available' | 'registered' | 'reserved' | 'unknown';
  createdAt?: string;
  priceUsd?: number | null;
};

export function useCheckDomain() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDomain = async (domain: string): Promise<CheckResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('check-domain', {
        body: { domain: domain.trim().toLowerCase() }
      });

      if (functionError) {
        throw functionError;
      }

      // Edge function now returns { status, createdAt, priceUsd }
      const rawData = data as any;
      
      return {
        status: rawData.status || 'unknown',
        createdAt: rawData.createdAt || undefined,
        priceUsd: rawData.priceUsd || null
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Domain check failed';
      setError(errorMessage);
      console.error('Domain check error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { checkDomain, loading, error };
}
