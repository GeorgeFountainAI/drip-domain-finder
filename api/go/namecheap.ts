// api/go/namecheap.ts
// Redirect handler for Namecheap affiliate links
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get domain from query parameter 'd'
  const domain = req.query.d;
  
  if (!domain || typeof domain !== 'string') {
    console.error('Missing or invalid domain parameter:', req.query);
    return res.status(400).json({ 
      error: "Missing domain parameter",
      message: "Please provide a domain using the ?d= query parameter",
      example: "/api/go/namecheap?d=example.com"
    });
  }

  // Clean and validate the domain
  const cleanDomain = domain.trim().toLowerCase();
  
  if (!cleanDomain || cleanDomain.length < 3) {
    return res.status(400).json({ 
      error: "Invalid domain",
      message: "Domain must be at least 3 characters"
    });
  }

  // Build the Namecheap affiliate URL with the domain parameter
  const affiliateBaseUrl = 'https://namecheap.pxf.io/gOzBbX';
  const namecheapUrl = `${affiliateBaseUrl}?url=${encodeURIComponent(`https://www.namecheap.com/domains/registration/results/?domain=${cleanDomain}`)}`;

  console.log(`Redirecting to Namecheap for domain: ${cleanDomain}`);
  
  // Redirect to Namecheap affiliate link
  return res.redirect(302, namecheapUrl);
}
