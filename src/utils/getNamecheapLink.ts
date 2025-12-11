/**
 * Generate direct Namecheap affiliate link for domain purchases
 * @param domain - The domain name to purchase
 * @returns The direct Namecheap URL with affiliate tracking
 */
export function getNamecheapLink(domain: string): string {
  const AFFILIATE_ID = "gOzBbX"; // Impact.com affiliate ID
  const cleanDomain = domain?.trim().toLowerCase() || '';
  return `https://www.namecheap.com/domains/registration/results/?domain=${cleanDomain}&affid=${AFFILIATE_ID}&subid=${cleanDomain}`;
}
