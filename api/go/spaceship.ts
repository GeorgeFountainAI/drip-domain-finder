import type { VercelRequest, VercelResponse } from '@vercel/node';

function sanitizeDomain(domain: string): string {
  // Remove protocol, www, and trailing slashes
  return domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()
    .trim();
}

function isValidDomain(domain: string): boolean {
  // Basic domain validation - allows letters, numbers, dots, hyphens
  const domainRegex = /^[a-z0-9.-]+\.[a-z]{2,}$/i;
  return domainRegex.test(domain) && domain.length <= 253;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Accept both 'domain' and 'd' query parameters for flexibility
  const domainParam = (req.query.domain || req.query.d) as string;

  console.log(`[Spaceship Redirect] Incoming request:`, {
    method: req.method,
    query: req.query,
    userAgent: req.headers['user-agent']
  });

  if (!domainParam || typeof domainParam !== 'string') {
    console.warn(`[Spaceship Redirect] Missing or invalid domain parameter:`, { domainParam });
    return res.status(400).json({ 
      error: 'Domain parameter is required',
      usage: 'Use: /api/go/spaceship?domain=example.com'
    });
  }

  // Sanitize and validate the domain
  const sanitizedDomain = sanitizeDomain(domainParam);
  
  if (!isValidDomain(sanitizedDomain)) {
    console.warn(`[Spaceship Redirect] Invalid domain format:`, { 
      original: domainParam, 
      sanitized: sanitizedDomain 
    });
    return res.status(400).json({ 
      error: 'Invalid domain format',
      domain: sanitizedDomain
    });
  }

  // Build the Spaceship search URL
  let spaceshipUrl = `https://www.spaceship.com/domain/search?q=${encodeURIComponent(sanitizedDomain)}`;
  
  // Add CJ affiliate ID if available
  const cjAffiliateId = process.env.CJ_AFFILIATE_ID;
  if (cjAffiliateId) {
    spaceshipUrl += `&aid=${encodeURIComponent(cjAffiliateId)}`;
    console.log(`[Spaceship Redirect] Using CJ affiliate ID for domain:`, sanitizedDomain);
  } else {
    console.log(`[Spaceship Redirect] No CJ affiliate ID configured, using direct link for domain:`, sanitizedDomain);
  }

  console.log(`[Spaceship Redirect] Redirecting to:`, spaceshipUrl);
  
  // Perform 307 redirect (temporary redirect that preserves method)
  res.redirect(307, spaceshipUrl);
}