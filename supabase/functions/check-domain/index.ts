import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CheckResult = {
  status: "available" | "registered" | "unknown" | "error";
  createdAt?: string | null;
  priceUsd?: number | null;
  source?: string;
  message?: string;
};

function isValidDomain(d: string): boolean {
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(d);
}

/**
 * NAMECHEAP IS THE SINGLE SOURCE OF TRUTH FOR DOMAIN AVAILABILITY
 * 
 * Rules:
 * 1. If Namecheap reports available=true → domain IS available (no overrides)
 * 2. If Namecheap API fails → return "error" status with retry message
 * 3. Never default to "unavailable" on API failure
 * 4. Log all responses for debugging
 */
async function checkWithNamecheap(domain: string): Promise<CheckResult> {
  const apiUser = Deno.env.get("NAMECHEAP_API_USER");
  const apiKey = Deno.env.get("NAMECHEAP_API_KEY");
  const clientIp = Deno.env.get("NAMECHEAP_CLIENT_IP");

  if (!apiUser || !apiKey || !clientIp) {
    console.error("❌ Namecheap API credentials not configured");
    return { 
      status: "error", 
      source: "namecheap",
      message: "Namecheap API not configured - please retry later"
    };
  }

  const url = `https://api.namecheap.com/xml.response?ApiUser=${encodeURIComponent(apiUser)}&ApiKey=${encodeURIComponent(apiKey)}&UserName=${encodeURIComponent(apiUser)}&ClientIp=${encodeURIComponent(clientIp)}&Command=namecheap.domains.check&DomainList=${encodeURIComponent(domain)}`;

  try {
    console.log(`🔍 Checking domain availability via Namecheap: ${domain}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/xml' }
    });

    if (!response.ok) {
      console.error(`❌ Namecheap API HTTP error: ${response.status} ${response.statusText}`);
      return { 
        status: "error", 
        source: "namecheap",
        message: `Namecheap API error (${response.status}) - please retry`
      };
    }

    const xml = await response.text();
    console.log(`📄 Namecheap response for ${domain}: ${xml.substring(0, 500)}...`);

    // Parse the XML response
    // Look for Available="true" or Available="false"
    const availableMatch = xml.match(/Available="(true|false)"/i);
    const premiumMatch = xml.match(/IsPremiumName="(true|false)"/i);
    const priceMatch = xml.match(/PremiumRegistrationPrice="([\d.]+)"/i);
    
    if (!availableMatch) {
      // Check for API errors in response
      const errorMatch = xml.match(/<Error[^>]*>([^<]+)<\/Error>/i);
      if (errorMatch) {
        console.error(`❌ Namecheap API error: ${errorMatch[1]}`);
        return { 
          status: "error", 
          source: "namecheap",
          message: `Namecheap error: ${errorMatch[1]} - please retry`
        };
      }
      
      console.error(`❌ Could not parse Namecheap availability response`);
      return { 
        status: "error", 
        source: "namecheap",
        message: "Unable to verify availability - please retry"
      };
    }

    const isAvailable = availableMatch[1].toLowerCase() === 'true';
    const isPremium = premiumMatch ? premiumMatch[1].toLowerCase() === 'true' : false;
    const premiumPrice = priceMatch ? parseFloat(priceMatch[1]) : null;

    // Get default pricing for the TLD
    const tld = domain.split('.').pop()?.toLowerCase() || 'com';
    const defaultPrice = getDefaultPrice(tld);
    
    const finalPrice = isPremium && premiumPrice ? premiumPrice : defaultPrice;

    console.log(`✅ Namecheap result for ${domain}: available=${isAvailable}, premium=${isPremium}, price=${finalPrice}`);

    if (isAvailable) {
      // NAMECHEAP SAYS AVAILABLE → DOMAIN IS AVAILABLE (NO OVERRIDES!)
      return {
        status: "available",
        priceUsd: finalPrice,
        source: "namecheap",
        createdAt: null
      };
    } else {
      return {
        status: "registered",
        priceUsd: null,
        source: "namecheap",
        createdAt: null
      };
    }

  } catch (error) {
    console.error(`❌ Namecheap API exception for ${domain}:`, error);
    return { 
      status: "error", 
      source: "namecheap",
      message: `Unable to verify availability - please retry (${error.message})`
    };
  }
}

function getDefaultPrice(tld: string): number {
  const prices: { [key: string]: number } = {
    'com': 12.98, 'net': 14.98, 'org': 14.98, 'io': 39.98, 'ai': 89.98,
    'app': 19.98, 'dev': 15.98, 'tech': 49.98, 'co': 32.98, 'xyz': 9.98,
    'online': 39.98, 'store': 59.98, 'blog': 32.98, 'shop': 34.98, 'info': 16.98
  };
  return prices[tld] || 15.98;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain: domainParam } = await req.json();
    const domain = (domainParam || "").trim().toLowerCase();

    if (!isValidDomain(domain)) {
      return new Response(
        JSON.stringify({ error: "Invalid domain" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // NAMECHEAP IS THE SINGLE SOURCE OF TRUTH
    const result = await checkWithNamecheap(domain);
    
    // Log the final result
    console.log(`📊 Final result for ${domain}:`, JSON.stringify(result));

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Check domain error:", error);
    // Return error status, NOT unknown - never default to unavailable
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: "Unable to verify availability - please retry",
        createdAt: null 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
});