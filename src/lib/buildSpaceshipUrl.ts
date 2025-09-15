export function buildSpaceshipUrl(domain: string): string {
  const base = 'https://www.spaceship.com/domains/search';
  const u = new URL(base);
  u.searchParams.set('query', domain);
  const aff = 'https://spaceship.sjv.io/APQy0D';
  if (aff) u.searchParams.set('aff', aff);
  return u.toString();
}