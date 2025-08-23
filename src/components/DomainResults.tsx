// src/components/DomainResults.tsx
import React from 'react';
import { buildSpaceshipUrl } from '../utils/spaceship';

export type DomainResult = {
  domain: string;
  available: boolean;
  price: number;
  flipScore?: number;
};

interface Props {
  results: DomainResult[];
}

const DomainResults: React.FC<Props> = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200/60 bg-white/70 p-6 text-center text-gray-600">
        No results found. Try a broader keyword (e.g., <strong>ai</strong>) or use a
        wildcard like <strong>ai*</strong>.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Minimal trust badge */}
      <div className="text-xs text-gray-400 opacity-70 text-right">
        🛡️ Trust Layer Certified · Tested. Logged. Safe to Buy.
      </div>

      {results.map((r) => (
        <div
          key={r.domain}
          className="flex items-center justify-between rounded-lg border border-gray-200/60 bg-white/80 p-4"
        >
          <div className="space-y-1">
            <div className="text-lg font-semibold">{r.domain}</div>
            <div className="text-sm text-gray-600">
              {r.available ? 'Available' : 'Unavailable'} · ${r.price.toFixed(2)} /year
              {typeof r.flipScore === 'number' && (
                <span className="ml-2" title="Flip Score estimates resale potential from 0–100">
                  · Flip Score: {Math.min(100, r.flipScore)}
                </span>
              )}
            </div>
          </div>

          <a
            className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            target="_blank"
            rel="noopener noreferrer"
            href={buildSpaceshipUrl(r.domain)}
          >
            Buy Now ↗
          </a>
        </div>
      ))}
    </div>
  );
};

export default DomainResults;
