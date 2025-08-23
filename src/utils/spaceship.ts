
/**
 * Spaceship affiliate link utilities
 */

export const buildSpaceshipUrl = (domain: string): string => {
  const baseUrl = 'https://www.spaceship.com/domains/domain-registration/results';
  const searchParam = `search=${encodeURIComponent(domain)}`;
  const directUrl = `${baseUrl}?${searchParam}`;
  
  // CJ Network affiliate tracking
  const cjAffiliateId = '6354443';
  const cjSubId = '1794549';
  const cjPublisherId = '21274';
  
  return `https://spaceship.sjv.io/c/${cjAffiliateId}/${cjSubId}/${cjPublisherId}?url=${encodeURIComponent(directUrl)}`;
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
