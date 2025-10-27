import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type CheckResult = {
  domain: string;
  available: boolean;
  registeredAt?: string | null;
  registrar?: string | null;
  source: "rdap" | "whoisxml" | "assumed";
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

      return data as CheckResult;
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
