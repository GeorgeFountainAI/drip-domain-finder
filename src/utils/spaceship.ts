
/**
 * Spaceship affiliate link utilities
 */

export const buildFallbackSearchUrl = (domain: string): string => {
  return `https://www.spaceship.com/search?q=${encodeURIComponent(domain)}`;
};

export const buildSpaceshipUrl = (domain: string): string => {
  try {
    // Build inner Spaceship search URL
    const inner = `https://www.spaceship.com/domains?search=${encodeURIComponent(domain)}&irgwc=1`;
    
    // Try to use CJ deeplink base from environment
    const cjBase = import.meta.env.VITE_CJ_DEEPLINK_BASE;
    
    if (cjBase) {
      let href: string;
      
      // Check if CJ base already includes "u="
      if (cjBase.includes('u=')) {
        href = `${cjBase}${encodeURIComponent(inner)}`;
      } else {
        // Add ?u= or &u= depending on whether base already has query params
        const separator = cjBase.includes('?') ? '&u=' : '?u=';
        href = `${cjBase}${separator}${encodeURIComponent(inner)}`;
      }
      
      // DEV-only logging
      if (import.meta.env.DEV) {
        console.log('Affiliate link generated:', href);
        const urlObj = new URL(href);
        const uParam = urlObj.searchParams.get('u');
        if (uParam) {
          console.log('Inner URL:', decodeURIComponent(uParam));
        }
      }
      
      return href;
    }
    
    // Fallback to plain Spaceship search URL with tracking
    if (import.meta.env.DEV) {
      console.log('Affiliate link generated:', inner);
    }
    
    return inner;
  } catch (error) {
    console.warn('[AffiliateFallback]', domain, error);
    return buildFallbackSearchUrl(domain);
  }
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const openInBatches = async (
  domains: string[],
  batchSize: number = 5,
  delayMs: number = 1000,
  openFn: (url: string) => void = (url) => {
    try {
      window.open(url, '_blank');
    } catch (error) {
      console.warn('[AffiliateFallback]', url, error);
      // Try fallback URL
      window.open(buildFallbackSearchUrl(url), '_blank');
    }
  }
): Promise<void> => {
  // Remove duplicates and empty domains
  const uniqueDomains = Array.from(new Set(domains.filter(d => d && d.trim())));
  
  const batches = chunk(uniqueDomains, batchSize);
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    // Open all domains in current batch
    batch.forEach(domain => {
      const url = buildSpaceshipUrl(domain.trim());
      openFn(url);
    });
    
    // Wait before next batch (except for last batch)
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};
