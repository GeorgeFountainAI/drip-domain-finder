// src/utils/spaceship.ts

// --- Helpers ---------------------------------------------------------------
function normalizeDomain(name: string) {
  return name.trim().toLowerCase();
}
function enc(s: string) {
  return encodeURIComponent(s);
}

// --- URL builders ----------------------------------------------------------
// Now defaults to search page instead of cart (cart was unreliable).
export function spaceshipSearchUrl(domain: string) {
  const d = enc(normalizeDomain(domain));
  return `https://www.spaceship.com/domains/domain-registration/results?search=${d}`;
}

// Set your CJ base if/when approved; otherwise leave as "" for direct links.
const CJ_CLICK_BASE = "https://spaceship.sjv.io/c/6354443/1794549/21274?url=";

export function buildSpaceshipUrl(domain: string) {
  const target = spaceshipSearchUrl(domain);
  if (!CJ_CLICK_BASE) return target;
  return `${CJ_CLICK_BASE}${enc(target)}`;
}

export function buildSpaceshipUrlWithFallback(domain: string) {
  const primary = buildSpaceshipUrl(domain); // search page
  const search = CJ_CLICK_BASE
    ? `${CJ_CLICK_BASE}${enc(spaceshipSearchUrl(domain))}`
    : spaceshipSearchUrl(domain);
  return { primary, search };
}

// --- Window open helpers (for bulk open UX) -------------------------------
/**
 * Opens a single domain in a new tab. Returns true if the popup opened, false if blocked.
 */
export function openSingle(domain: string): boolean {
  if (typeof window === "undefined") return false; // SSR guard
  const url = buildSpaceshipUrl(domain);
  const w = window.open(url, "_blank", "noopener,noreferrer");
  return !!w;
}

/**
 * Open many domains in batches to reduce popup blocking.
 * @param domains array of domain strings
 * @param batchSize number of tabs per batch (default 5)
 * @param delayMs delay between batches in ms (default 300)
 * @param openFn custom function to open URLs (default uses window.open)
 * @returns { opened: number, blocked: number }
 */
export async function openInBatches(
  domains: string[],
  batchSize = 5,
  delayMs = 300,
  openFn: (url: string) => void = (url) => window.open(url, '_blank', 'noopener')
): Promise<{ opened: number; blocked: number }> {
  if (typeof window === "undefined") return { opened: 0, blocked: 0 };

  let opened = 0;
  let blocked = 0;

  for (let i = 0; i < domains.length; i += batchSize) {
    const batch = domains.slice(i, i + batchSize);
    for (const d of batch) {
      const url = buildSpaceshipUrl(d);
      openFn(url);
      opened++;
    }

    // Add delay between batches
    if (i + batchSize < domains.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { opened, blocked: 0 };
}

/** split into chunks of size n */
export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
