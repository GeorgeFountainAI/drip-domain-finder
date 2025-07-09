import { registerMultipleDomains } from '../server/namecheap.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domains } = req.body;

  // Validate request body
  if (!domains || !Array.isArray(domains) || domains.length === 0) {
    return res.status(400).json({ error: 'Domains array is required and must not be empty' });
  }

  // Validate each domain
  for (const domain of domains) {
    if (!domain || typeof domain !== 'string' || domain.trim() === '') {
      return res.status(400).json({ error: 'All domains must be valid non-empty strings' });
    }
  }

  try {
    const results = await registerMultipleDomains(domains);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error purchasing domains:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}