import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CheckResult = {
  status: "available" | "registered" | "unknown";
  createdAt?: string | null;
  priceUsd?: number | null;
};

const RDAP_ENDPOINT = (d: string) => `https://rdap.org/domain/${encodeURIComponent(d)}`;
const WHOISXML_AVAIL = (d: string, k: string) =>
  `https://domain-availability.whoisxmlapi.com/api/v1?apiKey=${encodeURIComponent(k)}&domainName=${encodeURIComponent(d)}&outputFormat=JSON`;

function isValidDomain(d: string): boolean {
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(d);
}

async function getPriceIfAvailable(domain: string): Promise<number | null> {
  const url = Deno.env.get("PRICE_PROVIDER_URL");
  const key = Deno.env.get("PRICE_PROVIDER_KEY");
  if (!url) return null;
  
  try {
    const headers: Record<string, string> = {};
    if (key) headers['Authorization'] = `Bearer ${key}`;
    
    const r = await fetch(`${url}?domain=${encodeURIComponent(domain)}`, { headers });
    if (!r.ok) return null;
    const data = await r.json();
    return typeof data?.priceUsd === "number" ? data.priceUsd : null;
  } catch {
    return null;
  }
}

async function rdapLookup(domain: string): Promise<CheckResult | null> {
  try {
    const r = await fetch(RDAP_ENDPOINT(domain));
    
    // RDAP 404 → domain is available
    if (r.status === 404) {
      return { status: "available", createdAt: null };
    }
    
    // Non-OK responses → unknown
    if (!r.ok) {
      return { status: "unknown", createdAt: null };
    }
    
    const data = await r.json();
    
    // Check for registration indicators:
    // 1. events contains "registration" (case-insensitive)
    const hasRegistrationEvent = data?.events?.some((e: any) => 
      e?.eventAction?.toLowerCase() === "registration"
    );
    
    // 2. nameservers is a non-empty array
    const hasNameservers = Array.isArray(data?.nameservers) && data.nameservers.length > 0;
    
    // 3. entities contains registrar/registrant role
    const hasRegistrarEntity = data?.entities?.some((e: any) => 
      Array.isArray(e?.roles) && e.roles.some((role: string) => 
        ["registrar", "registrant"].includes(role.toLowerCase())
      )
    );
    
    // If any indicator holds → registered
    if (hasRegistrationEvent || hasNameservers || hasRegistrarEntity) {
      // Find earliest registration date
      const registrationDates = data?.events
        ?.filter((e: any) => e?.eventAction?.toLowerCase() === "registration")
        ?.map((e: any) => e?.eventDate)
        ?.filter(Boolean) || [];
      
      const createdAt = registrationDates.length > 0 
        ? registrationDates.sort()[0] 
        : null;
      
      return { status: "registered", createdAt };
    }
    
    // No clear indicators → unknown
    return { status: "unknown", createdAt: null };
  } catch (error) {
    console.error("RDAP lookup error:", error);
    return { status: "unknown", createdAt: null };
  }
}

async function whoisXmlFallback(domain: string): Promise<CheckResult | null> {
  const key = Deno.env.get("WHOISXML_API_KEY");
  if (!key) return null;
  
  try {
    const r = await fetch(WHOISXML_AVAIL(domain, key));
    if (!r.ok) return null;
    
    const data = await r.json();
    const avail = data?.domainAvailability === "AVAILABLE";
    
    if (avail) {
      return { status: "available", createdAt: null };
    } else {
      return { status: "registered", createdAt: null };
    }
  } catch (error) {
    console.error("WhoisXML fallback error:", error);
    return null;
  }
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

    // 1) RDAP first (authoritative)
    let result = await rdapLookup(domain);

    // 2) Fallback to WHOISXML availability (optional)
    if (!result || result.status === "unknown") {
      const fallback = await whoisXmlFallback(domain);
      if (fallback) result = fallback;
    }

    // 3) If still nothing, return unknown
    if (!result) {
      result = { status: "unknown", createdAt: null };
    }

    // 4) Only fetch price if available
    if (result.status === "available") {
      result.priceUsd = await getPriceIfAvailable(domain);
    }

    // Always return 200 with the status JSON shape
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Check domain error:", error);
    // Always return 200 with unknown status on errors
    return new Response(
      JSON.stringify({ status: "unknown", createdAt: null }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
});
