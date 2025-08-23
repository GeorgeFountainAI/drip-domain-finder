'use client';

import { useState } from 'react';
import DomainResults from '@/components/DomainResults';

async function fetchDomains(query: string) {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  return await res.json();
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Find Your Perfect Domain</h1>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border rounded-lg p-3 text-lg"
          placeholder="e.g. stair*, ai*, blackbeauty"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="bg-violet-600 text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90"
          onClick={() => setSubmitted(true)}
        >
          Search
        </button>
      </div>
      {submitted && query && (
        <DomainResults query={query} fetcher={fetchDomains} />
      )}
    </main>
  );
}
