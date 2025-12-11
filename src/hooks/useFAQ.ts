import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

const DEFAULT_FAQ_DATA: FAQItem[] = [
  {
    id: "what-is-domaindrip",
    question: "What is DomainDrip?",
    answer: "DomainDrip is an AI-powered domain marketplace designed for entrepreneurs, investors, and creatives. We curate premium domains, provide intelligent search tools, and offer unique features like Flip Score analysis to help you discover, buy, and flip domain names with precision and insight."
  },
  {
    id: "flip-score",
    question: "How does the Flip Score work?",
    answer: "Our proprietary Flip Score algorithm analyzes multiple factors including domain length, TLD popularity, brandability, pronounceability, trending keywords, and market trends. Scores range from 0-100, with higher scores indicating better flip potential and investment value."
  },
  {
    id: "purchase-domain",
    question: "How do I purchase a domain I like?",
    answer: "When you find a domain you want, click the 'Buy on Namecheap' button. This will redirect you to our trusted partner Namecheap.com where you can complete the purchase securely. We earn a small affiliate commission to keep DomainDrip running, but this doesn't affect your purchase price."
  },
  {
    id: "signup-credits",
    question: "How many credits do I get when I sign up?",
    answer: "Every new user gets 20 free credits when signing up. After that, credits can be purchased via Stripe."
  },
  {
    id: "credits-search",
    question: "How do credits work for domain searches?",
    answer: "Domain searches consume credits to cover API costs and AI processing. Each search typically costs 1 credit. You can purchase additional credits through our secure Stripe-powered checkout system when needed."
  },
  {
    id: "add-credits",
    question: "How do I add credits?",
    answer: "Click on your credit balance in the header or the 'Purchase Credits' button to access our credit store. We offer various credit packages at different price points. All payments are processed securely through Stripe for your protection."
  }
];

export const useFAQ = () => {
  const [faqData, setFaqData] = useState<FAQItem[]>(DEFAULT_FAQ_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQ();
  }, []);

  const fetchFAQ = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('faq')
        .select('id, question, answer')
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.warn('Error fetching FAQ from database, using defaults:', fetchError);
        setFaqData(DEFAULT_FAQ_DATA);
        setError(null); // Don't show error to user, just use fallback
        return;
      }

      if (data && data.length > 0) {
        setFaqData(data);
      } else {
        // No FAQ data in database, use defaults
        console.log('No FAQ data found in database, using defaults');
        setFaqData(DEFAULT_FAQ_DATA);
      }
    } catch (err) {
      console.warn('Network or other error fetching FAQ, using defaults:', err);
      setFaqData(DEFAULT_FAQ_DATA);
      setError(null); // Don't show error to user, just use fallback
    } finally {
      setLoading(false);
    }
  };

  return {
    faqData,
    loading,
    error,
    refetch: fetchFAQ
  };
};