export function buildSpaceshipUrl(domainRaw: string) {
  try {
    const domain = (domainRaw ?? '').trim();
    if (!domain) return 'https://www.spaceship.com/domains/domain-registration/';
    const baseSearch = `https://www.spaceship.com/domains/domain-registration/results?search=${encodeURIComponent(domain)}`;
    const affiliateBase = import.meta.env.VITE_SPACESHIP_AFF;
    if (affiliateBase && /^https?:\/\//i.test(affiliateBase)) {
      return `${affiliateBase}?u=${encodeURIComponent(baseSearch)}`;
    }
    return baseSearch;
  } catch {
    return 'https://www.spaceship.com/domains/domain-registration/';
  }
}

/** split into chunks of size n */
export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** open URLs in batches with throttle to reduce popup blocking */
export async function openInBatches(
  domains: string[],
  batchSize = 5,
  delayMs = 300,
  openFn: (url: string) => void = (url) => window.open(url, '_blank', 'noopener')
) {
  const unique = Array.from(new Set(domains.map(d => (d ?? '').trim()).filter(Boolean)));
  const groups = chunk(unique, batchSize);
  for (let i = 0; i < groups.length; i++) {
    groups[i].forEach(d => openFn(buildSpaceshipUrl(d)));
    if (i < groups.length - 1) await new Promise(r => setTimeout(r, delayMs));
  }
}
