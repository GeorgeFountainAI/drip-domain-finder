
/**
 * Spaceship affiliate link utilities
 */

export const buildSpaceshipUrl = (domain: string): string => {
  // Try to use CJ deeplink base from environment
  const cjBase = import.meta.env.VITE_CJ_DEEPLINK_BASE;
  
  if (cjBase) {
    // Build CJ affiliate deeplink
    const spaceshipSearchUrl = `https://www.spaceship.com/domains?search=${encodeURIComponent(domain)}&irgwc=1`;
    return `${cjBase}u=${encodeURIComponent(spaceshipSearchUrl)}`;
  }
  
  // Fallback to plain Spaceship search URL with tracking
  return `https://www.spaceship.com/domains?search=${encodeURIComponent(domain)}&irgwc=1`;
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
  openFn: (url: string) => void = (url) => window.open(url, '_blank')
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
