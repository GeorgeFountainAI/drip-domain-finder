import { searchDomains } from '../server/namecheap';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { keyword } = req.query;

  // Check if keyword is provided
  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    const result = await searchDomains(keyword);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error searching domains:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}