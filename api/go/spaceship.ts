import type { VercelRequest, VercelResponse } from '@vercel/node';

const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const domain = String(req.query.d || '').trim();

    if (!domain) {
      return res.status(400).json({ error: 'Missing required query param: d' });
    }
    if (!DOMAIN_RE.test(domain)) {
      return res.status(400).json({ error: 'Invalid domain format', domain });
    }

    const aff = process.env.NEXT_PUBLIC_SPACESHIP_AFFILIATE_ID?.trim();
    const url = new URL('https://www.spaceship.com/domains/search');
    url.searchParams.set('query', domain);
    if (aff) url.searchParams.set('aff', aff);

    // Use 302 so client navigates and preserves analytics.
    res.setHeader('Location', url.toString());
    return res.status(302).end();
  } catch (err: any) {
    return res
      .status(400)
      .json({ error: 'Redirect failed', detail: String(err?.message || err) });
  }
}