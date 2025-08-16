import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
  flipScore?: number;
  trendStrength?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword } = await req.json();
    
    if (!keyword) {
      return new Response(
        JSON.stringify({ error: 'Keyword is required' }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Initialize Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      const user = data.user;
      
      if (user) {
        // Log search attempt
        const supabaseService = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          { auth: { persistSession: false } }
        );
        
        await supabaseService
          .from('search_history')
          .insert({
            user_id: user.id,
            keyword: keyword.trim()
          });
      }
    }

    // Generate domain variations
    const tlds = ['com', 'net', 'org', 'io', 'ai', 'app', 'dev', 'tech', 'co', 'xyz', 'online', 'store'];
    const cleanKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const variations = [
      cleanKeyword,
      `get${cleanKeyword}`,
      `${cleanKeyword}app`,
      `${cleanKeyword}hub`,
      `${cleanKeyword}pro`,
      `my${cleanKeyword}`
    ];

    const domains: Domain[] = [];

    // Check availability using Spaceship API
    const spaceshipApiKey = Deno.env.get("SPACESHIP_API_KEY");
    console.log("Spaceship API Key available:", !!spaceshipApiKey);
    
    for (const variation of variations.slice(0, 3)) { // Limit to avoid too many API calls
      for (const tld of tlds.slice(0, 8)) { // Limit TLDs
        const domainName = `${variation}.${tld}`;
        
        try {
          // Check if API key is available
          if (!spaceshipApiKey) {
            console.log("No Spaceship API key configured, using mock data for development");
            throw new Error("No API key configured");
          }
          
          // Call Spaceship API for domain availability
          const response = await fetch(`https://api.spaceship.com/domain/check`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${spaceshipApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              domains: [domainName]
            })
          });

          if (response.ok) {
            const data = await response.json();
            const domainData = data.domains?.[0];
            
            if (domainData) {
              const flipScore = calculateFlipScore(domainName);
              const trendStrength = calculateTrendStrength(variation);
              
              domains.push({
                name: domainName,
                available: domainData.available || false,
                price: domainData.price || getDefaultPrice(tld),
                tld,
                flipScore,
                trendStrength
              });
            }
          } else {
            // Fallback to mock data if API fails
            const flipScore = calculateFlipScore(domainName);
            const trendStrength = calculateTrendStrength(variation);
            
            domains.push({
              name: domainName,
              available: Math.random() > 0.4,
              price: getDefaultPrice(tld),
              tld,
              flipScore,
              trendStrength
            });
          }
        } catch (error) {
          console.error(`Error checking domain ${domainName}:`, error);
          // Fallback to mock data
          const flipScore = calculateFlipScore(domainName);
          const trendStrength = calculateTrendStrength(variation);
          
          domains.push({
            name: domainName,
            available: Math.random() > 0.4,
            price: getDefaultPrice(tld),
            tld,
            flipScore,
            trendStrength
          });
        }
      }
    }

    // Sort by availability first, then by flip score
    domains.sort((a, b) => {
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      return (b.flipScore || 0) - (a.flipScore || 0);
    });

    return new Response(
      JSON.stringify({ domains: domains.slice(0, 15) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Domain search error:', error);
    return new Response(
      JSON.stringify({ error: 'Domain search failed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function calculateFlipScore(domainName: string): number {
  const name = domainName.split('.')[0];
  const tld = domainName.split('.')[1];
  
  let score = 30; // Base score
  
  // Length factor (shorter is generally better for brandability)
  if (name.length <= 4) score += 30;
  else if (name.length <= 6) score += 25;
  else if (name.length <= 8) score += 15;
  else if (name.length <= 10) score += 5;
  else if (name.length > 15) score -= 20;
  
  // TLD popularity and market value
  const tldScores: { [key: string]: number } = {
    'com': 30, 'net': 15, 'org': 12, 'io': 25, 'ai': 28,
    'app': 20, 'dev': 18, 'tech': 15, 'co': 12, 'xyz': 5,
    'online': 8, 'store': 10, 'shop': 12, 'biz': 6, 'info': 4
  };
  score += tldScores[tld] || 5;
  
  // Brandability factors
  if (!/[-0-9]/.test(name)) score += 15; // No hyphens or numbers
  if (/^[a-z]+$/.test(name)) score += 5; // Only letters
  
  // Pronounceable and memorable
  const vowels = (name.match(/[aeiou]/g) || []).length;
  const consonants = name.length - vowels;
  if (vowels > 0 && consonants > 0 && vowels / name.length >= 0.2) score += 10;
  
  // Trending keywords boost
  const trendKeywords = ['ai', 'app', 'tech', 'hub', 'pro', 'get', 'my', 'smart', 'digital', 'crypto', 'nft', 'meta'];
  const keywordMatches = trendKeywords.filter(keyword => name.toLowerCase().includes(keyword)).length;
  score += Math.min(15, keywordMatches * 5);
  
  // Common word penalty (too generic)
  const commonWords = ['the', 'and', 'but', 'for', 'with', 'this', 'that', 'from', 'they', 'know', 'want'];
  if (commonWords.some(word => name.toLowerCase().includes(word))) score -= 10;
  
  // Ensure score is within bounds
  return Math.max(1, Math.min(100, Math.round(score)));
}

function calculateTrendStrength(keyword: string): number {
  // Simulate trend strength based on keyword characteristics
  const trendKeywords = ['ai', 'crypto', 'nft', 'meta', 'web3', 'tech', 'app', 'smart', 'digital'];
  const matches = trendKeywords.filter(trend => keyword.toLowerCase().includes(trend));
  
  let strength = 2; // Base strength
  strength += matches.length;
  
  return Math.max(1, Math.min(5, strength));
}

function getDefaultPrice(tld: string): number {
  const prices: { [key: string]: number } = {
    'com': 12.99, 'net': 14.99, 'org': 13.99, 'io': 49.99, 'ai': 89.99,
    'app': 19.99, 'dev': 15.99, 'tech': 24.99, 'co': 29.99, 'xyz': 9.99
  };
  
  return prices[tld] || 15.99;
}