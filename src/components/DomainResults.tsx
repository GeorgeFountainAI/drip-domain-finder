
// /src/components/DomainResults.tsx
import { useEffect, useState } from "react";
import { trackEvent } from "@/utils/analytics";
import { TrustBadge } from "./TrustBadge";

export default function DomainResults({ query, fetcher }: { query: string; fetcher: (q: string) => Promise<any> }) {
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const buildBuyLink = (domain: string) => {
    const url = `https://www.spaceship.com/domains?search=${encodeURIComponent(domain.trim())}`;
    const cjBase = import.meta.env.VITE_CJ_DEEPLINK_BASE;
    if (!cjBase) return url;
    const wrapped = `${cjBase.endsWith("=") ? cjBase : cjBase + "="}${encodeURIComponent(url + "&irgwc=1")}`;
    return wrapped;
  };

  useEffect(() => {
    let isActive = true;
    async function search() {
      setLoading(true);
      try {
        const res = await fetcher(query);
        const raw = res?.data ?? res ?? {};
        const results = Array.isArray(raw.results) ? raw.results.filter(r => r?.domain) : [];
        const suggestions = Array.isArray(raw.suggestions) ? raw.suggestions : [];
        if (isActive) {
          setResults(results);
          setSuggestions(suggestions);
          setErr("");
        }
      } catch (e: any) {
        if (isActive) {
          setResults([]);
          setSuggestions([]);
          setErr("Search failed");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }
    if (query?.trim()) search();
    return () => {
      isActive = false;
    };
  }, [query]);

  const handleBuyClick = (domain: string, flipScore: number) => {
    trackEvent('domain_click', {
      domain,
      flipScore,
      buttonType: 'Buy on Spaceship',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="mt-6 relative">
      {loading && <div className="text-center text-gray-500">Searching...</div>}
      {err && <div className="text-center text-red-600">{err}</div>}
      {!loading && !err && results.length === 0 && (
        <div className="text-center text-gray-600 border rounded-xl p-6">
          No results found. Try a broader keyword (e.g., <strong>ai</strong>) or use a wildcard like <strong>ai*</strong>.
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <div className="font-medium mb-1">Suggestions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s: string) => (
              <span key={s} className="border rounded-full px-3 py-1 text-sm">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      <ul className="space-y-4">
        {results.map((r: any) => {
          const buyHref = buildBuyLink(r.domain);
          const priceText = r.price ? `$${r.price.toFixed(2)}/year` : "—";
          const flip = typeof r.flipScore === "number" ? r.flipScore : Math.floor(50 + Math.random() * 30);
          return (
            <li key={r.domain} className="flex items-center justify-between border rounded-2xl p-4">
              <div className="min-w-0">
                <div className="font-semibold text-lg truncate">{r.domain}</div>
                <div className="text-sm text-gray-500">
                  {r.status ?? "Available"} • {priceText} • Flip Score: {flip}
                </div>
              </div>
              <a
                href={buyHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleBuyClick(r.domain, flip)}
                className="bg-violet-600 text-white px-4 py-2 rounded-2xl font-medium hover:opacity-90"
              >
                Buy Now ↗
              </a>
            </li>
          );
        })}
      </ul>
      
      {/* Trust Badge - only show when we have results and not loading */}
      {!loading && !err && results.length > 0 && <TrustBadge />}
    </div>
  );
}
