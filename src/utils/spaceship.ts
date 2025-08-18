// src/utils/spaceship.ts

// --- Helpers ---------------------------------------------------------------
function normalizeDomain(name: string) {
  return name.trim().toLowerCase();
}
function enc(s: string) {
  return encodeURIComponent(s);
}

// --- URL builders ----------------------------------------------------------
// Preferred: go straight to add-to-cart for a specific domain.
export function spaceshipCartUrl(domain: string) {
  const d = enc(normalizeDomain(domain));
  return `https://www.spaceship.com/cart/domain/register?domain=${d}`;
}

// Fallback: search results page (use only if cart has issues).
export function spaceshipSearchUrl(domain: string) {
  const d = enc(normalizeDomain(domain));
  // Note: no trailing slash before ?search
  return `https://www.spaceship.com/domains/domain-registration/results?search=${d}`;
}

// Set your CJ base if/when approved; otherwise leave as "" for direct links.
const CJ_CLICK_BASE = "";
// Example (replace Xs): const CJ_CLICK_BASE = "https://www.anrdoezrs.net/click-XXXXXX-YYYYYY?url=";

export function buildSpaceshipUrl(domain: string) {
  const target = spaceshipCartUrl(domain);
  if (!CJ_CLICK_BASE) return target;
  return `${CJ_CLICK_BASE}${enc(target)}`;
}

export function buildSpaceshipUrlWithFallback(domain: string) {
  const primary = buildSpaceshipUrl(domain); // cart
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
 * @returns { opened: number, blocked: number }
 */
export async function openInBatches(
  domains: string[],
  batchSize = 5,
  delayMs = 300
): Promise<{ opened: number; blocked: number }> {
  if (typeof window === "undefined") return { opened: 0, blocked: 0 };

  let opened = 0;
  let blocked = 0;

  for (let i = 0; i < domains.length; i += batchSize) {
    const batch = domains.slice(i, i + batchSize);
    for (const d of batch) {
      const ok = openSingle(d);
      ok ? opened++ : blocked++;
    }
