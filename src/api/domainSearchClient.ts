import { supabase } from "@/integrations/supabase/client";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
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
    available: Math.random() > 0.4, // 60% chance of being available
    price: parseFloat((9.99 + Math.random() * 20).toFixed(2)),
    tld
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
        available: Math.random() > 0.3,
        price: parseFloat((9.99 + Math.random() * 25).toFixed(2)),
        tld
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

// Main domain search function with fallback
export const searchDomains = async (keyword: string, forceDemoMode = false): Promise<SearchResponse> => {
  const cleanKeyword = keyword.trim();
  
  if (!cleanKeyword) {
    return { domains: [], error: 'Keyword is required' };
  }
  
  // Always use demo mode for now since external API integration isn't ready
  const demoMode = forceDemoMode || true;
  
  try {
    if (demoMode) {
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
      
      const mockDomains = generateEnhancedMockDomains(cleanKeyword);
      await logSearchAttempt(cleanKeyword, true);
      
      return {
        domains: mockDomains,
        isDemo: true
      };
    }
    
    // Real API integration would go here
    // For now, fallback to demo mode
    const mockDomains = generateMockDomains(cleanKeyword);
    await logSearchAttempt(cleanKeyword, true);
    
    return {
      domains: mockDomains,
      isDemo: true
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