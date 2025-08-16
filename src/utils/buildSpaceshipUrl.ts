export function buildSpaceshipUrl(domain: string) {
  const base = 'https://www.spaceship.com/domains/domain-registration/results';
  const params = new URLSearchParams();
  params.set('search', domain.trim());
  const ref = process.env.NEXT_PUBLIC_SPACESHIP_REF?.trim();
  if (ref) params.set('ref', ref);
  const camp = process.env.NEXT_PUBLIC_SPACESHIP_CAMPAIGN?.trim();
  if (camp) {
    params.set('utm_source', 'domaindrip');
    params.set('utm_medium', 'affiliate');
    params.set('utm_campaign', camp);
  }
  return `${base}?${params.toString()}`;
}