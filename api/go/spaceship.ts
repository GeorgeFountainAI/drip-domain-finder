import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { d: domain } = req.query;

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Domain parameter is required' });
  }

  // Build the Spaceship search URL
  const spaceshipUrl = `https://www.spaceship.com/domain-search?query=${encodeURIComponent(domain)}`;
  
  // Redirect to Spaceship
  res.redirect(302, spaceshipUrl);
}