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
  checkStatus?: 'verified' | 'error' | 'pending';
}

/**
 * NAMECHEAP IS THE SINGLE SOURCE OF TRUTH FOR DOMAIN AVAILABILITY
 * 
 * Rules:
 * 1. If Namecheap reports available=true → domain IS available (no RDAP/WHOIS overrides)
 * 2. If Namecheap API fails → show "retry" state, NOT unavailable
 * 3. Pricing differences are acceptable - availability takes precedence
 * 4. Log all Namecheap responses with timestamps
 */
async function checkWithNamecheap(domain: string, supabaseService: any): Promise<{ 
  available: boolean | null; 
  price: number | null;
  checkStatus: 'verified' | 'error';
}> {
  const apiUser = Deno.env.get("NAMECHEAP_API_USER");
  const apiKey = Deno.env.get("NAMECHEAP_API_KEY");
  const clientIp = Deno.env.get("NAMECHEAP_CLIENT_IP");

  if (!apiUser || !apiKey || !clientIp) {
    console.error("❌ Namecheap API credentials not configured");
    await logValidation(supabaseService, domain, 'namecheap', 'error', 'API credentials not configured');
    return { available: null, price: null, checkStatus: 'error' };
  }

  const url = `https://api.namecheap.com/xml.response?ApiUser=${encodeURIComponent(apiUser)}&ApiKey=${encodeURIComponent(apiKey)}&UserName=${encodeURIComponent(apiUser)}&ClientIp=${encodeURIComponent(clientIp)}&Command=namecheap.domains.check&DomainList=${encodeURIComponent(domain)}`;

  try {
    console.log(`🔍 Namecheap check: ${domain} at ${new Date().toISOString()}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/xml' }
    });

    if (!response.ok) {
      console.error(`❌ Namecheap HTTP error: ${response.status}`);
      await logValidation(supabaseService, domain, 'namecheap', 'error', 
        `HTTP ${response.status} - API temporarily unavailable`);
      return { available: null, price: null, checkStatus: 'error' };
    }

    const xml = await response.text();
    console.log(`📄 Namecheap response for ${domain}: ${xml.substring(0, 300)}...`);

    // Parse XML response
    const availableMatch = xml.match(/Available="(true|false)"/i);
    const premiumMatch = xml.match(/IsPremiumName="(true|false)"/i);
    const priceMatch = xml.match(/PremiumRegistrationPrice="([\d.]+)"/i);
    
    // Check for API errors
    const errorMatch = xml.match(/<Error[^>]*>([^<]+)<\/Error>/i);
    if (errorMatch) {
      console.error(`❌ Namecheap API error: ${errorMatch[1]}`);
      await logValidation(supabaseService, domain, 'namecheap', 'error', 
        `API error: ${errorMatch[1]}`);
      return { available: null, price: null, checkStatus: 'error' };
    }

    if (!availableMatch) {
      console.error(`❌ Could not parse Namecheap response for ${domain}`);
      await logValidation(supabaseService, domain, 'namecheap', 'error', 
        'Could not parse availability from response');
      return { available: null, price: null, checkStatus: 'error' };
    }

    const isAvailable = availableMatch[1].toLowerCase() === 'true';
    const isPremium = premiumMatch ? premiumMatch[1].toLowerCase() === 'true' : false;
    const premiumPrice = priceMatch ? parseFloat(priceMatch[1]) : null;

    // Get default pricing for the TLD
    const tld = domain.split('.').pop()?.toLowerCase() || 'com';
    const defaultPrice = getDefaultPrice(tld);
    const finalPrice = isPremium && premiumPrice ? premiumPrice : defaultPrice;

    // Log the Namecheap result
    const status = isAvailable ? 'available' : 'registered';
    await logValidation(supabaseService, domain, 'namecheap', status, 
      `Namecheap verified: available=${isAvailable}, premium=${isPremium}, price=${finalPrice}`);

    console.log(`✅ Namecheap verified ${domain}: available=${isAvailable}, price=${finalPrice}`);

    // NAMECHEAP SAYS AVAILABLE → DOMAIN IS AVAILABLE (NO OVERRIDES!)
    return { 
      available: isAvailable, 
      price: finalPrice,
      checkStatus: 'verified'
    };

  } catch (error) {
    console.error(`❌ Namecheap exception for ${domain}:`, error);
    await logValidation(supabaseService, domain, 'namecheap', 'error', 
      `Exception: ${error.message}`);
    return { available: null, price: null, checkStatus: 'error' };
  }
}

async function logValidation(supabaseService: any, domain: string, source: string, status: string, message: string) {
  try {
    await supabaseService
      .from('validation_logs')
      .insert({
        domain,
        source,
        status,
        message,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log validation:', error);
  }
}

function calculateFlipScore(domainName: string): number {
  const name = domainName.split('.')[0];
  const tld = domainName.split('.')[1];
  
  let score = 30;
  
  if (name.length <= 4) score += 30;
  else if (name.length <= 6) score += 25;
  else if (name.length <= 8) score += 15;
  else if (name.length <= 10) score += 5;
  else if (name.length > 15) score -= 20;
  
  const tldScores: { [key: string]: number } = {
    'com': 30, 'net': 15, 'org': 12, 'io': 25, 'ai': 28,
    'app': 20, 'dev': 18, 'tech': 15, 'co': 12, 'xyz': 5,
    'online': 8, 'store': 10, 'shop': 12, 'biz': 6, 'info': 4
  };
  score += tldScores[tld] || 5;
  
  if (!/[-0-9]/.test(name)) score += 15;
  if (/^[a-z]+$/.test(name)) score += 5;
  
  const vowels = (name.match(/[aeiou]/g) || []).length;
  const consonants = name.length - vowels;
  if (vowels > 0 && consonants > 0 && vowels / name.length >= 0.2) score += 10;
  
  const trendKeywords = ['ai', 'app', 'tech', 'hub', 'pro', 'get', 'my', 'smart', 'digital', 'crypto', 'nft', 'meta'];
  const keywordMatches = trendKeywords.filter(keyword => name.toLowerCase().includes(keyword)).length;
  score += Math.min(15, keywordMatches * 5);
  
  const commonWords = ['the', 'and', 'but', 'for', 'with', 'this', 'that', 'from', 'they', 'know', 'want'];
  if (commonWords.some(word => name.toLowerCase().includes(word))) score -= 10;
  
  return Math.max(1, Math.min(100, Math.round(score)));
}

function calculateTrendStrength(keyword: string): number {
  const trendKeywords = ['ai', 'crypto', 'nft', 'meta', 'web3', 'tech', 'app', 'smart', 'digital'];
  const matches = trendKeywords.filter(trend => keyword.toLowerCase().includes(trend));
  
  let strength = 2;
  strength += matches.length;
  
  return Math.max(1, Math.min(5, strength));
}

function getDefaultPrice(tld: string): number {
  const prices: { [key: string]: number } = {
    'com': 12.99, 'net': 14.99, 'org': 13.99, 'io': 49.99, 'ai': 89.99,
    'app': 19.99, 'dev': 15.99, 'tech': 24.99, 'co': 29.99, 'xyz': 9.99,
    'online': 39.99, 'store': 59.99, 'shop': 34.99
  };
  return prices[tld] || 15.99;
}

serve(async (req) => {
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

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Log search
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      const user = data.user;
      
      if (user) {
        await supabaseService
          .from('search_history')
          .insert({
            user_id: user.id,
            keyword: keyword.trim()
          });
      }
    }

    // Generate domain variations
    const tlds = ['com', 'net', 'org', 'io', 'ai', 'app', 'dev', 'tech', 'co'];
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
    const pendingDomains: Domain[] = [];

    console.log(`🚀 Starting domain search for "${keyword}" at ${new Date().toISOString()}`);

    // Check domains with Namecheap as the SINGLE SOURCE OF TRUTH
    for (const variation of variations.slice(0, 3)) {
      for (const tld of tlds.slice(0, 6)) {
        const domainName = `${variation}.${tld}`;
        
        // Check with Namecheap - THE AUTHORITATIVE SOURCE
        const namecheapResult = await checkWithNamecheap(domainName, supabaseService);
        
        if (namecheapResult.checkStatus === 'error') {
          // API FAILED - show as pending/retry, NOT unavailable
          pendingDomains.push({
            name: domainName,
            available: false, // Will be shown as "retry" in UI
            price: getDefaultPrice(tld),
            tld,
            flipScore: calculateFlipScore(domainName),
            trendStrength: calculateTrendStrength(variation),
            checkStatus: 'error'
          });
        } else if (namecheapResult.available === true) {
          // NAMECHEAP SAYS AVAILABLE → DOMAIN IS AVAILABLE (NO OVERRIDES!)
          domains.push({
            name: domainName,
            available: true,
            price: namecheapResult.price || getDefaultPrice(tld),
            tld,
            flipScore: calculateFlipScore(domainName),
            trendStrength: calculateTrendStrength(variation),
            checkStatus: 'verified'
          });
        }
        // If registered, we simply don't add it to results
      }
    }

    // Sort by flip score
    domains.sort((a, b) => (b.flipScore || 0) - (a.flipScore || 0));

    // Combine available domains with pending ones (pending at the end)
    const allDomains = [...domains, ...pendingDomains].slice(0, 15);

    console.log(`🏁 Search complete: ${domains.length} available, ${pendingDomains.length} pending, total=${allDomains.length}`);

    return new Response(
      JSON.stringify({ 
        domains: allDomains,
        meta: {
          availableCount: domains.length,
          pendingCount: pendingDomains.length,
          source: 'namecheap',
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Domain search error:', error);
    return new Response(
      JSON.stringify({ error: 'Domain search failed - please retry' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});