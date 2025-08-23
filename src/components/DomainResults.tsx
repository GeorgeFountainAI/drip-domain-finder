"use client";

import { useState } from "react";
import { useSearchStore } from "@/lib/store";
import { buildSpaceshipUrl } from "@/utils/spaceship";

export default function DomainResults() {
  const results = useSearchStore((s) => s.results);
  const loading = useSearchStore((s) => s.loading);

  if (!results.length && !loading) return null;

  return (
    <div className="space-y-6 mt-10">
      {results.map((r) => (
        <div
          key={r.domain}
          className="border border-purple-500 rounded-xl p-6 shadow-md bg-white dark:bg-zinc-900"
        >
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-purple-700">{r.domain}</div>
            <div className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
              Flip Score: {r.flipScore || "N/A"}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            {r.available ? (
              <span className="text-green-600 font-medium">✅ Available</span>
            ) : (
              <span className="text-red-600 font-medium">❌ Unavailable</span>
            )}
            <span className="text-gray-600">${r.price}/year</span>
          </div>

          {r.available && (
            <a
              href={buildSpaceshipUrl(r.domain)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded transition"
            >
              BUY NOW ↗
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
