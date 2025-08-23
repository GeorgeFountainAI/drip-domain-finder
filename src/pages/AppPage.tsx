// src/pages/AppPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import DomainResults from '../components/DomainResults';
import { useSearchStore } from '@/lib/store';

type DomainResult = {
  domain: string;
  available: boolean;
  price: number;
  flipScore?: number;
};

// ---- Permanent, no‑backend search engine (deterministic & wildcard aware) ----
function normalize(q: string) {
  return (q || '').trim().toLowerCase();
}
function tokenize(q: string) {
  // split on whitespace and punctuation; keep * as wildcard
  return normalize(q).split(/[\s,;|]+/).filter(Boolean);
}
function permute(base: string) {
  const left = ['', 'get', 'try', 'go', 'join', 'use'];
  const right = ['', 'app', 'hq', 'labs', 'pro', 'hub', 'tech', 'ai'];
  const out: string[] = [];
  for (const l of left) for (const r of right) out.push(`${l}${l ? '' : ''}${base}${r}`);
  return Array.from(new Set(out));
}
function applyWildcardFilter(names: string[], parts: string[]) {
  // each part may have * wildcard. Convert to RegExp and require ALL parts to match.
  const regs = parts.map((p) => {
    const esc = p.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${esc}$`, 'i');
  });
  return names.filter((n) => regs.every((rx) => rx.test(n.replace(/\.[a-z]+$/, ''))));
}
function generateCandidates(query: string, count = 24): DomainResult[] {
  const parts = tokenize(query || 'brand');
  const stem = parts.find((p) => p.replace(/\*/g, '').length) || 'brand';
  const bare = stem.replace(/\*/g, '') || 'brand';

  const tlds = ['.com', '.io', '.ai', '.app', '.co', '.dev'];
  const bases = Array.from(
    new Set([
      bare,
      ...permute(bare),
      // some stylistic variants
      `${bare}ly`,
      `${bare}go`,
      `${bare}-hub`,
      `${bare}-pro`,
    ])
  );

  let names = bases.flatMap((b) => tlds.map((t) => `${b}${t}`));

  // wildcard filtering (on the label before TLD)
  if (parts.length) names = applyWildcardFilter(names, parts);

  // deterministic shuffle based on query for stable lists
  const seed = normalize(query).split('').reduce((s, c) => s + c.charCodeAt(0), 0) || 1;
  names.sort((a, b) => ((a.length + seed) % 7) - ((b.length + seed) % 7));

  const price = (i: number) => Number((9.99 + ((i + seed) % 17) + Math.random() * 3).toFixed(2));
  const score = (i: number) => Math.min(100, Math.max(40, Math.round(55 + ((i + seed) % 45))));

  return names.slice(0, count).map((d, i) => ({
    domain: d,
    available: true,          // we default to "available" for UX; purchase flow confirms
    price: price(i),
    flipScore: score(i),
  }));
}
// -----------------------------------------------------------------------------

const AppPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const { setResults, setLoading, loading } = useSearchStore();

  // Prevent "Back" → login by stabilizing the history state on /app
  useEffect(() => {
    try {
      if (location.pathname !== '/app') {
        window.history.replaceState(null, '', '/app');
      }
    } catch {}
  }, []);

  // Load last query to keep session comfy
  useEffect(() => {
    const last = localStorage.getItem('dd:lastQuery');
    if (last) setQ(last);
  }, []);

  const placeholder = useMemo(
    () => 'Search by keyword or *wildcard (e.g., ai*, *bot, black*beauty)…',
    []
  );

  // Fetcher function that matches DomainResults interface
  const fetcher = async (query: string) => {
    const data = generateCandidates(query || 'brand', 24);
    return {
      results: data,
      suggestions: []
    };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);
    setLoading(true);
    try {
      const data = generateCandidates(q || 'brand', 24);
      setResults(data);
      localStorage.setItem('dd:lastQuery', q);
    } catch (e) {
      console.error(e);
      setErrMsg('Search temporarily unavailable. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-sm">
        <h1 className="text-3xl font-bold mb-2 text-center">Find Your Perfect Domain</h1>
        <p className="text-center text-gray-600 mb-4">
          Discover available domains with clean, fast search and instant purchase.
        </p>

        <form onSubmit={onSubmit} className="flex gap-3 items-center justify-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            className="w-full max-w-xl rounded-lg border px-4 py-3 outline-none focus:ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-purple-600 px-5 py-3 text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {loading ? 'Searching…' : 'Search Domains'}
          </button>
        </form>

        {errMsg && <p className="mt-4 text-center text-red-600">{errMsg}</p>}
      </div>

      <div className="mt-6">
        <DomainResults />
      </div>
    </div>
  );
};

export default AppPage;
