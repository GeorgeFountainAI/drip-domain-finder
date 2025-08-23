"use client";

import { useState } from "react";
import { useSelectedDomains } from "@/lib/store";
import { buildSpaceshipUrl } from "@/utils/spaceship";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
  flipScore?: number;
}

interface DomainResultsProps {
  domains: Domain[];
  onAddToCart: (domains: Domain[]) => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function DomainResults({ domains, onAddToCart, onBack, isLoading }: DomainResultsProps) {
  const { selectedDomains, addDomain, removeDomain, clearDomains } = useSelectedDomains();

  // Filter to only show available domains
  const availableDomains = domains.filter(d => d.available);
  
  if (!availableDomains.length && !isLoading) return null;

  return (
    <div className="space-y-6 mt-10">
      {availableDomains.map((domain) => (
        <div
          key={domain.name}
          className="border border-purple-500 rounded-xl p-6 shadow-md bg-white dark:bg-zinc-900"
        >
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-purple-700">{domain.name}</div>
            {domain.flipScore && (
              <div className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
                Flip Score: {domain.flipScore}
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-green-600 font-medium">✅ Available</span>
            <span className="text-gray-600">${domain.price}/year</span>
          </div>

          <a
            href={buildSpaceshipUrl(domain.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded transition"
          >
            BUY NOW ↗
          </a>
        </div>
      ))}
    </div>
  );
}
