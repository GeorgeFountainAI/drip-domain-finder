import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CheckResult = {
  domain: string;
  available: boolean;
  registeredAt?: string | null;
  registrar?: string | null;
  source: "rdap" | "whoisxml" | "assumed";
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
    
    if (r.status === 404) {
      // not found in RDAP -> available
      return { domain, available: true, registeredAt: null, registrar: null, source: "rdap" };
    }
    
    if (!r.ok) return null;
    
    const data = await r.json();
    
    // If RDAP returns a domain object, it exists -> unavailable
    const registrar = data?.registrar || 
      data?.entities?.find((e: any) => e?.roles?.includes("registrar"))
        ?.vcardArray?.[1]?.find((v: any[]) => v[0] === "fn")?.[3] || null;
    
    const created = data?.events?.find((e: any) => e?.eventAction === "registration")?.eventDate ||
      data?.events?.find((e: any) => e?.eventAction === "creation")?.eventDate || null;

    return { domain, available: false, registeredAt: created, registrar, source: "rdap" };
  } catch (error) {
    console.error("RDAP lookup error:", error);
    return null;
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
    
    return { domain, available: !!avail, registeredAt: null, registrar: null, source: "whoisxml" };
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
    if (!result) {
      result = await whoisXmlFallback(domain);
    }

    // 3) If still nothing, assume unavailable to be safe
    if (!result) {
      result = { 
        domain, 
        available: false, 
        registeredAt: null, 
        registrar: null, 
        source: "assumed" 
      };
    }

    // 4) Only fetch price if actually available
    if (result.available) {
      result.priceUsd = await getPriceIfAvailable(domain);
    } else {
      result.priceUsd = null;
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Check domain error:", error);
    return new Response(
      JSON.stringify({ error: "Domain check failed" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
