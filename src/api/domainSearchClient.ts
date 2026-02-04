import { supabase } from "@/integrations/supabase/client";
import { domainScoringService } from "@/services/domainScoring";

interface Domain {
  name: string;
  available: boolean;
  price: number | null;
  tld: string;
  flipScore?: number; // 1-100, brandability + resale potential
  trendStrength?: number; // 1-5 stars, keyword trends
  checkStatus?: 'verified' | 'error' | 'pending';
}

interface SearchResponse {
  domains: Domain[];
  error?: string;
  isDemo?: boolean;
}

// Mock domain data for demo/fallback mode
const generateMockDomains = (keyword: string): Domain[] => {
  const tlds = ['com', 'net', 'org', 'io', 'ai', 'app', 'dev', 'tech', 'co'];
  const cleanKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return tlds.map(tld => ({
    name: `${cleanKeyword}.${tld}`,
    available: false, // Unknown until Namecheap verifies
    price: null, // No fabricated price
    tld,
    // IMPORTANT: never imply "unavailable" from fallback data
    checkStatus: 'pending'
  }));
};

// Enhanced mock with variations
const generateEnhancedMockDomains = (keyword: string): Domain[] => {
  const cleanKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
  const variations = [
    cleanKeyword,
    `get${cleanKeyword}`,
    `${cleanKeyword}app`,
    `${cleanKeyword}hub`,
    `${cleanKeyword}pro`,
    `my${cleanKeyword}`,
    `${cleanKeyword}ly`,
    `${cleanKeyword}io`
  ];
  
  const tlds = ['com', 'net', 'org', 'io', 'ai', 'app', 'dev', 'tech', 'co'];
  const domains: Domain[] = [];
  
  variations.forEach(variation => {
    tlds.slice(0, 3).forEach(tld => {
      domains.push({
        name: `${variation}.${tld}`,
        available: false, // Unknown until Namecheap verifies
        price: null, // No fabricated price
        tld,
        // IMPORTANT: never imply "unavailable" from fallback data
        checkStatus: 'pending'
      });
    });
  });
  
  return domains.sort(() => Math.random() - 0.5).slice(0, 15);
};

// Check if user is admin (for credit bypass)
export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Check if user email is in admin list
    const adminEmails = ['admin@domaindrip.ai', 'demo@domaindrip.ai', 'test@admin.com'];
    return adminEmails.includes(user.email || '');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Log search attempts and errors
const logSearchAttempt = async (keyword: string, success: boolean, error?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log(`Domain search: keyword="${keyword}", success=${success}`, error ? `error="${error}"` : '');
    
    if (user) {
      await supabase
        .from('search_history')
        .insert({
          user_id: user.id,
          keyword: keyword.trim()
        });
    }
  } catch (logError) {
    console.error('Failed to log search attempt:', logError);
  }
};

/**
 * Enhanced domain search function with comprehensive API integration
 * Features:
 * - Real-time domain availability checking via Spaceship API
 * - Intelligent fallback to mock data when API is unavailable
 * - Domain scoring and ranking system
 * - Search history logging for analytics
 * - Admin bypass functionality for testing
 * - Enhanced error handling and user feedback
 */
export const searchDomains = async (keyword: string, forceDemoMode = false): Promise<SearchResponse> => {
  const cleanKeyword = keyword.trim();
  
  if (!cleanKeyword) {
    return { domains: [], error: 'Keyword is required' };
  }
  
  // Direct lookup mode: if input matches full domain pattern, perform live Namecheap check immediately
  const fullDomainPattern = /^[a-z0-9-]+\.[a-z]{2,}$/i;
  if (fullDomainPattern.test(cleanKeyword)) {
    const exactDomain = cleanKeyword.toLowerCase();
    const tld = exactDomain.split('.').pop() || '';

    try {
      // Live availability check at search time (Namecheap is source of truth)
      const { data: checkData, error: checkError } = await supabase.functions.invoke('check-domain', {
        body: { domain: exactDomain }
      });

      if (checkError) {
        throw new Error(checkError.message);
      }

      const status = (checkData as any)?.status as string | undefined;
      const priceUsd = (checkData as any)?.priceUsd as number | null | undefined;

      await logSearchAttempt(cleanKeyword, true);

      return {
        domains: [{
          name: exactDomain,
          available: status === 'available',
          price: typeof priceUsd === 'number' ? priceUsd : null,
          tld,
          // For UI: allow retry state if Namecheap check failed
          checkStatus: status === 'error' ? 'error' : 'verified'
        }],
        isDemo: false
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to verify availability - please retry';
      console.error('Direct domain check error:', err);
      await logSearchAttempt(cleanKeyword, false, errorMessage);

      return {
        domains: [{
          name: exactDomain,
          available: false,
          price: null,
          tld,
          checkStatus: 'error'
        }],
        error: 'Unable to verify — retry',
        isDemo: false
      };
    }
  }
  
  // Only use demo mode if explicitly forced (for presentations)
  const demoMode = forceDemoMode;
  
  try {
    if (demoMode) {
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
      
      const mockDomains = generateEnhancedMockDomains(cleanKeyword);
      
      // Add scores to available domains
      const availableDomains = mockDomains.filter(d => d.available);
      if (availableDomains.length > 0) {
        const scores = await domainScoringService.getBatchScores(
          availableDomains.map(d => d.name)
        );
        
        mockDomains.forEach(domain => {
          if (domain.available && scores.has(domain.name)) {
            const domainScore = scores.get(domain.name)!;
            domain.flipScore = domainScore.flipScore;
            domain.trendStrength = domainScore.trendStrength;
          }
        });
      }
      
      await logSearchAttempt(cleanKeyword, true);
      
      return {
        domains: mockDomains,
        isDemo: true
      };
    }
    
    // Use Spaceship API via edge function
    const { data, error } = await supabase.functions.invoke('spaceship-domain-search', {
      body: { keyword: cleanKeyword }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    await logSearchAttempt(cleanKeyword, true);
    
    // Client-side fallback: If edge function returns empty results, generate demo data
    if (!data.domains || data.domains.length === 0) {
      console.log('Edge function returned no domains, falling back to enhanced mock data');
      
      const fallbackDomains = generateEnhancedMockDomains(cleanKeyword);
      
      // Add scores to available domains
      const availableDomains = fallbackDomains.filter(d => d.available);
      if (availableDomains.length > 0) {
        const scores = await domainScoringService.getBatchScores(
          availableDomains.map(d => d.name)
        );
        
        fallbackDomains.forEach(domain => {
          if (domain.available && scores.has(domain.name)) {
            const domainScore = scores.get(domain.name)!;
            domain.flipScore = domainScore.flipScore;
            domain.trendStrength = domainScore.trendStrength;
          }
        });
      }
      
      return {
        domains: fallbackDomains,
        error: 'Using demo results - API temporarily unavailable',
        isDemo: true
      };
    }
    
    // Ensure checkStatus is propagated from edge function response
    const domainsWithStatus = (data.domains || []).map((d: any) => ({
      name: d.name,
      available: d.available,
      price: d.price,
      tld: d.tld,
      flipScore: d.flipScore,
      trendStrength: d.trendStrength,
      // CRITICAL: use server-provided verification state; if missing, treat as pending
      checkStatus: d.checkStatus || 'pending'
    }));

    return {
      domains: domainsWithStatus,
      isDemo: false
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Domain search failed';
    console.error('Domain search error:', error);
    
    await logSearchAttempt(cleanKeyword, false, errorMessage);
    
    // Return demo data as fallback
    const fallbackDomains = generateMockDomains(cleanKeyword);
    return {
      domains: fallbackDomains,
      error: `API temporarily unavailable. Showing demo results.`,
      isDemo: true
    };
  }
};

export default searchDomains;