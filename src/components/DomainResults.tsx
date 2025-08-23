// /src/components/DomainResults.tsx
import { useEffect, useState } from "react";

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

  return (
    <div className="mt-6">
      {loading && <div className="text-center text-gray-500">Searching...</div>}
      {err && <div className="text-center text-red-600">{err}</div>}
      {!loading && !err && results.length === 0 && (
        <div className="text-center text-gray-600 border rounded-xl p-6">
          No results found. Try a broader keyword (e.g., <strong>ai</strong>) or use a wildcard like{" "}
          <strong
