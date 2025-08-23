// src/components/DomainResults.tsx

import React from 'react';
import { buildSpaceshipUrl } from '@/utils/spaceship';
import { useSelectedDomains } from '../lib/store';
import { trackDomainBuyClick, trackDomainSelection } from '@/utils/analytics';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TrustBadge from './TrustBadge';

type DomainResult = {
  domain: string;
  available: boolean;
  price: number;
  flipScore?: number;
};

interface Props {
  results: DomainResult[];
}

const DomainResults: React.FC<Props> = ({ results }) => {
  const {
    selectedDomains,
    add: selectDomain,
    remove: deselectDomain,
    clear: clearSelected,
  } = useSelectedDomains();

  const toggleSelection = (domain: string, flipScore?: number) => {
    const isSelected = selectedDomains.includes(domain);
    
    if (isSelected) {
      deselectDomain(domain);
    } else {
      selectDomain(domain);
    }
    
    // Track selection analytics
    trackDomainSelection(domain, !isSelected, flipScore);
  };

  const openAffiliateLinks = () => {
    const selected = results.filter((d) =>
      selectedDomains.includes(d.domain)
    );
    selected.forEach((d) => {
      window.open(buildSpaceshipUrl(d.domain), '_blank', 'noopener,noreferrer');
    });
  };

  // Filter to show only available domains (excluding getsupermind.com)
  const availableResults = results.filter(d => 
    d.available && d.domain !== 'getsupermind.com'
  );

  const handleBuyClick = (domain: string, flipScore?: number) => {
    trackDomainBuyClick(domain, flipScore);
  };

  return (
    <TooltipProvider>
      <div className="relative">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Available Domains ({availableResults.length} found)
          </h2>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-1">Flip Score = Brand potential</p>
              <ul className="text-sm space-y-1">
                <li>• Short, memorable names</li>
                <li>• Trendy keywords</li>
                <li>• Available .com domains</li>
                <li>• High resale interest</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>

        {availableResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-2">No available domains found</p>
            <p className="text-sm text-muted-foreground">
              Try different keywords or use wildcards like ai* or *tech
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {availableResults.map((d) => (
            <div
              key={d.domain}
              className="flex items-center justify-between p-4 border border-border rounded-xl bg-card hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedDomains.includes(d.domain)}
                  onChange={() => toggleSelection(d.domain, d.flipScore)}
                  className="w-5 h-5 accent-primary"
                  aria-label={`Select ${d.domain}`}
                />
                <div>
                  <div className="font-semibold text-foreground text-lg">{d.domain}</div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                      ✅ Available
                    </span>
                    <span>${d.price.toFixed(2)}</span>
                    {d.flipScore && (
                      <span className="font-medium text-primary">
                        Flip Score: {d.flipScore}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <a
                href={buildSpaceshipUrl(d.domain)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleBuyClick(d.domain, d.flipScore)}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                BUY NOW
              </a>
            </div>
          ))}
        </div>

        {/* Trust Badge - only show when results are present */}
        <TrustBadge visible={availableResults.length > 0} />
      </div>
    </TooltipProvider>
  );
};

export default DomainResults;
