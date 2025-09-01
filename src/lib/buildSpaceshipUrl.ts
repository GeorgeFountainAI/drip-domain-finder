export function buildSpaceshipUrl(domain: string): string {
  const base = 'https://www.spaceship.com/domains/search';
  const u = new URL(base);
  u.searchParams.set('query', domain);
  const aff = import.meta.env.VITE_SPACESHIP_AFFILIATE_ID || (window as any)?.ENV?.NEXT_PUBLIC_SPACESHIP_AFFILIATE_ID;
  if (aff) u.searchParams.set('aff', aff);
  return u.toString();
}