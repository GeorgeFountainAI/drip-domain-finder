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
      const buyHref = buildSpaceshipUrl(r.domain, { sid: "domaindrip", campaign: "buy_button" });
      const pri
