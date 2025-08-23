// /src/components/DomainResults.tsx
import { useEffect, useMemo, useState } from "react";
import { buildSpaceshipUrl } from "@/utils/spaceship";

function normalizeSearchResponse(raw: any) {
  const base = raw?.data ?? raw ?? {};
  const toArray = <T>(v: unknown, map?: (x: any) => T): T[] =>
    Array.isArray(v) ? (map ? v.map(map) : (v as T[])) : [];

  const results = toArray(base.results, (x) => ({
    domain: String(x?.domain ?? x?.name ?? ""),
    price: typeof x?.price === "number" ? x.price : null,
    currency: x?.currency ?? x?.priceCurrency ?? null,
    status: x?.status ?? null,
    flipScore:
      typeof x?.flipScore === "number"
        ? x.flipScore
        : typeof x?.score === "number"
        ? x.score
        : null,
  })).filter((r) => r.domain);

  const suggestions = toArray(base.suggestions, (s) => String(s ?? "")).filter(Boolean);

  return { results, suggestions };
}

type Props = {
  query: string;
  fetcher: (q: string) => Promise<any>;
};

export default function DomainResults({ query, fetcher }: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!query?.trim()) {
        setResults([]);
        setSuggestions([]);
        setErr(null);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const raw = await fetcher(query);
        const norm = normalizeSearchResponse(raw);
        if (!alive) return;
        setResults(norm.results || []);
        setSuggestions(norm.suggestions || []);
      } catch (e: any) {
        if (!alive) return;
        setResults([]);
        setSuggestions([]);
        setErr(e?.message ?? "Search failed");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [query, fetcher]);

  const empty = !loading && !err && results.length === 0;

  const rows = useMemo(() => {
    return (results || []).map((r) => {
      const buyHref = buildSpaceshipUrl(r.domain, {
        sid: "domaindrip",
        campaign: "buy_button",
      });
      const priceText =
        typeof r.price === "number" && r.price >= 0
          ? `$${r.price.toFixed(2)} /year`
          : "—";
      const flip =
        typeof r.flipScore === "number"
          ? r.flipScore
          : Math.floor(50 + Math.random() * 30);
      return (
        <li
          key={r.domain}
          className="flex items-center justify-between rounded-2xl border p-4 my-2"
        >
          <div className="min-w-0">
            <div className="font-semibold truncate">{r.domain}</div>
            <div className="text-sm opacity-70">
              {r.status ?? "Available"} • {priceText} • Flip Score: {flip}
            </div>
          </div>
          <a
            href={buyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl px-4 py-2 font-medium shadow hover:opacity-90 bg-violet-600 text-white"
          >
            Buy Now ↗
          </a>
        </li>
      );
    });
  }, [results]);

  return (
    <div className="mt-4">
      {loading && (
        <div className="rounded-2xl border p-6 text-center">Searching…</div>
      )}
      {err && (
        <div className="rounded-2xl border p-6 text-red-600">
          Search error: {String(err)}
        </div>
      )}
      {empty && (
        <div className="rounded-2xl border p-6 text-center">
          No results found. Try a broader keyword (e.g.,{" "}
          <span className="font-semibold">ai</span>) or use a wildcard like{" "}
          <span className="font-semibold">ai*</span>.
        </div>
      )}
      {Array.isArray(suggestions) && suggestions.length > 0 && (
        <div className="rounded-2xl border p-4 my-3">
          <div className="font-medium mb-2">Suggestions</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <span
                key={s}
                className="rounded-full border px-3 py-1 text-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      <ul className="mt-2">{rows}</ul>
    </div>
  );
}
