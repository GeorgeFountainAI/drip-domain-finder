// src/utils/spaceship.ts
function normalizeDomain(name: string) {
  return name.trim().toLowerCase();
}

/** Direct add-to-cart (preferred) */
export function spaceshipCartUrl(domain: string) {
  const d = encodeURIComponent(normalizeDomain(domain));
  return `https://www.spaceship.com/cart/domain/register?domain=${d}`;
}

/** Search results (fallback) */
export function spaceshipSearchUrl(domain: string) {
  const d = encodeURIComponent(normalizeDomain(domain));
  return `https://www.spaceship.com/domains/domain-registration/results?search=${d}`;
}

/** If you have a CJ affiliate link, set it here; else leave empty string */
const CJ_CLICK_BASE = ""; 
// Example if/when approved:
// const CJ_CLICK_BASE = "https://www.anrdoezrs.net/click-XXXXXX-YYYYYY?url=";

export function buildSpaceshipUrl(domain: string) {
  // Prefer cart; Spaceship handles out-of-stock gracefully
  const target = spaceshipCartUrl(domain);

  if (!CJ_CLICK_BASE) return target; // direct link when no affiliate

  // Wrap the target in CJ link
  return `${CJ_CLICK_BASE}${encodeURIComponent(target)}`;
}

export function buildSpaceshipUrlWithFallback(domain: string) {
  const primary = buildSpaceshipUrl(domain); // cart
  const search = CJ_CLICK_BASE
    ? `${CJ_CLICK_BASE}${encodeURIComponent(spaceshipSearchUrl(domain))}`
    : spaceshipSearchUrl(domain);

  return { primary, search };
}
