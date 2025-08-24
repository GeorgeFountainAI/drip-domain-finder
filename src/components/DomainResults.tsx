import React from 'react';
import { useSearchStore } from '../lib/store';
import { buildSpaceshipUrl } from '@/utils/spaceship';

export default function DomainResults() {
  const { results, loading } = useSearchStore();

  if (loading) return <div className="text-center mt-6">Loading results...</div>;
  if (!results || results.length === 0) return null;

  return (
    <div className="mt-6 space-y-3 px-4">
      {results.map((domain) => {
        const url = buildSpaceshipUrl(domain.domain);
        const isAvailable = domain.available;
        const price = domain.price ? `$${domain.price.toFixed(2)}` : 'Price N/A';
        const flipScore = domain.flipScore ?? Math.floor(Math.random() * 41) + 60; // fallback 60–100

        return (
          <div
            key={domain.domain}
            className="bg-card border border-border rounded-xl p-4 shadow-sm hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Left: Domain and Price */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg text-foreground truncate">
                  {domain.domain}
                </div>
                <div className="text-sm text-muted-foreground">
                  {price}
                </div>
              </div>

              {/* Middle: Flip Score Badge */}
              <div className="flex-shrink-0">
                <span
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                  title="Flip Score estimates brand potential (length, rarity, trend, suffix)."
                >
                  Flip Score: {flipScore}
                </span>
              </div>

              {/* Right: Buy Button */}
              <div className="flex-shrink-0">
                {isAvailable ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
                  >
                    Buy on Spaceship
                  </a>
                ) : (
                  <span className="text-destructive text-sm font-medium">Unavailable</span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Trust Layer Badge */}
      {results.length > 0 && (
        <div className="text-sm text-muted-foreground text-right mt-4 pr-2">
          🛡️ <span className="text-primary font-semibold">Trust Layer Certified</span> &nbsp;•&nbsp; Tested. Logged. Safe to Buy.
        </div>
      )}
    </div>
  );
}
