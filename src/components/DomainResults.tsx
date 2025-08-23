import React, { useEffect, useState } from "react";
import { FlipScoreBadge } from "./FlipScoreBadge";
import TrustBadge from "./TrustBadge";
import { Button } from "@/components/ui/button";

interface DomainResult {
  name: string;
  isAvailable: boolean;
  flipScore?: number;
}

interface DomainResultsProps {
  domains: DomainResult[];
}

const DomainResults: React.FC<DomainResultsProps> = ({ domains }) => {
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  const handleCopy = (domain: string) => {
    navigator.clipboard.writeText(domain);
    setCopiedDomain(domain);
    setTimeout(() => setCopiedDomain(null), 1500);
  };

  const buildSpaceshipUrl = (domain: string): string => {
    const base = "https://www.spaceship.com/domains/search";
    const affiliate = "?utm_source=domain-drip&utm_medium=affiliate";
    return `${base}?q=${domain}${affiliate}`;
  };

  return (
    <div className="grid grid-cols-1 gap-4 mt-4">
      {domains.length === 0 ? (
        <p className="text-center text-gray-500">No domains found.</p>
      ) : (
        domains.map((domain) => (
          <div
            key={domain.name}
            className="flex items-center justify-between bg-white shadow rounded p-4"
          >
            <div>
              <p className="text-lg font-medium">{domain.name}</p>
              {domain.isAvailable && (
                <div className="flex gap-2 mt-1 items-center">
                  <FlipScoreBadge score={domain.flipScore ?? Math.floor(Math.random() * 100)} />
                  <TrustBadge />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <a
                href={buildSpaceshipUrl(domain.name)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>Buy Now</Button>
              </a>
              <Button variant="secondary" onClick={() => handleCopy(domain.name)}>
                {copiedDomain === domain.name ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DomainResults;
