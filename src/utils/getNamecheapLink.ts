/**
 * Generate Namecheap API redirect link for domain purchases
 * @param domain - The domain name to purchase
 * @returns The API redirect URL with encoded domain parameter
 */
export function getNamecheapLink(domain: string): string {
  if (!domain) {
    console.warn('getNamecheapLink called without domain');
    return '/api/go/namecheap';
  }
  return `/api/go/namecheap?d=${encodeURIComponent(domain.trim().toLowerCase())}`;
}
