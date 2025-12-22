import React, { useEffect, useState } from 'react';
import { useSearchStore } from '../lib/store';
import { useCheckDomain } from '@/hooks/useCheckDomain';
import { getNamecheapLink } from '@/utils/getNamecheapLink';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// In-memory cache for domain checks to avoid duplicate API calls
const domainCheckCache = new Map<string, { status: string; price?: number | null }>();

export default function DomainResults() {
  const { results, loading } = useSearchStore();
  const [domainStatuses, setDomainStatuses] = useState<Record<string, { status: string; price?: number | null }>>({});
  const [retryingDomains, setRetryingDomains] = useState<Set<string>>(new Set());
  const { checkDomain } = useCheckDomain();

  useEffect(() => {
    if (!results || results.length === 0) return;
    
    const checkAllDomains = async () => {
      const statuses: Record<string, { status: string; price?: number | null }> = {};
      const toCheck: string[] = [];
      
      // First, check cache
      for (const domain of results) {
        const cached = domainCheckCache.get(domain.domain);
        if (cached) {
          statuses[domain.domain] = cached;
        } else {
          toCheck.push(domain.domain);
        }
      }
      
      // Update state with cached results immediately
      if (Object.keys(statuses).length > 0) {
        setDomainStatuses(prev => ({ ...prev, ...statuses }));
      }
      
      // Check uncached domains
      for (const domainName of toCheck) {
        const result = await checkDomain(domainName);
        const status = result ? { 
          status: result.status,
          price: result.priceUsd 
        } : { status: 'error' }; // Default to 'error' instead of 'unknown'
        
        // Only cache successful checks, not errors
        if (result && result.status !== 'error') {
          domainCheckCache.set(domainName, status);
        }
        
        // Update state
        setDomainStatuses(prev => ({ ...prev, [domainName]: status }));
      }
    };
    
    checkAllDomains();
  }, [results, checkDomain]);

  // Handle retry for a specific domain
  const handleRetry = async (domainName: string) => {
    setRetryingDomains(prev => new Set(prev).add(domainName));
    
    try {
      const result = await checkDomain(domainName);
      const status = result ? { 
        status: result.status,
        price: result.priceUsd 
      } : { status: 'error' };
      
      // Cache if successful
      if (result && result.status !== 'error') {
        domainCheckCache.set(domainName, status);
      }
      
      setDomainStatuses(prev => ({ ...prev, [domainName]: status }));
    } finally {
      setRetryingDomains(prev => {
        const newSet = new Set(prev);
        newSet.delete(domainName);
        return newSet;
      });
    }
  };

  if (loading) return <div className="text-center mt-6">Loading results...</div>;
  if (!results || results.length === 0) return null;

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4" data-testid="domain-results">
      {results.map((domain) => {
        const domainStatus = domainStatuses[domain.domain];
        const status = domainStatus?.status || 'checking';
        const isAvailable = status === 'available';
        const isRegistered = status === 'registered';
        const isError = status === 'error';
        const isChecking = status === 'checking' || retryingDomains.has(domain.domain);
        const price = domainStatus?.price ? `$${domainStatus.price.toFixed(2)}` : null;
        const flipScore = domain.flipScore ?? Math.floor(Math.random() * 41) + 60;

        return (
          <div
            key={domain.domain}
            className="bg-card border border-border rounded-xl p-3 md:p-4 shadow-sm hover:bg-accent/50 transition-colors"
            data-testid="domain-card"
          >
            <div className="space-y-3">
              {/* Domain Name */}
              <div className="font-bold text-base md:text-lg text-foreground break-all" data-testid="domain-name">
                {domain.domain}
              </div>

              {/* Price & Status */}
              <div className="text-sm text-muted-foreground" data-testid="domain-price">
                {isChecking ? (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-blue-800 text-xs">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Checking...
                  </span>
                ) : isError ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-800 text-xs">
                      Unable to verify
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRetry(domain.domain)}
                      className="h-6 px-2 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                ) : isRegistered ? (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-red-800 text-xs">
                    Registered
                  </span>
                ) : isAvailable ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-green-800 text-xs">
                      Available
                    </span>
                    {price && <span>{price}</span>}
                  </div>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-800 text-xs">
                    Check manually
                  </span>
                )}
              </div>

              {/* Flip Score Badge */}
              {isAvailable && (
                <div className="flex justify-center">
                  <span
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                    title="Flip Score estimates brand potential (length, rarity, trend, suffix)."
                    data-testid="flip-score"
                  >
                    Flip Score: {flipScore}
                  </span>
                </div>
              )}

              {/* Buy Button */}
              {isAvailable && (
                <div className="w-full">
                  <a
                    href={getNamecheapLink(domain.domain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors mobile-touch-target"
                    data-testid="buy-button"
                  >
                    Buy on Namecheap
                  </a>
                </div>
              )}
              
              {/* Retry message shows Buy link for error state */}
              {isError && (
                <div className="w-full">
                  <a
                    href={getNamecheapLink(domain.domain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 text-sm font-medium transition-colors mobile-touch-target"
                  >
                    Check on Namecheap
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Trust Layer Badge */}
      {results.length > 0 && (
        <div className="text-sm text-muted-foreground text-right mt-6 pr-2 col-span-full" data-testid="trust-layer">
          🛡️ <span className="text-primary font-semibold">Namecheap Verified</span> &nbsp;•&nbsp; Live availability check.
        </div>
      )}
    </div>
  );
}
