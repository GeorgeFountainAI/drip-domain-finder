// /src/utils/spaceship.ts
const CJ_DEEPLINK_BASE = import.meta.env.VITE_CJ_DEEPLINK_BASE || "";

function getSpaceshipUrl(domain: string): string {
  const base = `https://www.spaceship.com/domains?search=${encodeURIComponent(domain.trim())}`;
  if (!CJ_DEEPLINK_BASE) return base;

  const wrapped = `${CJ_DEEPLINK_BASE.endsWith("=") ? CJ_DEEPLINK_BASE : CJ_DEEPLINK_BASE + "="}${encodeURIComponent(
    base + "&irgwc=1"
  )}`;
  return wrapped;
}

export function buildSpaceshipUrl(domain: string, opts?: { sid?: string; campaign?: string }) {
  return getSpaceshipUrl(domain);
}
