// api/go/spaceship.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { domain } = req.query;
  if (!domain) {
    return res.status(400).json({ error: "Missing domain parameter" });
  }

  const API_USER = process.env.NAMECHEAP_API_USER;
  const API_KEY = process.env.NAMECHEAP_API_KEY;
  const CLIENT_IP = process.env.NAMECHEAP_CLIENT_IP;

  const url = `https://api.namecheap.com/xml.response?ApiUser=${API_USER}&ApiKey=${API_KEY}&UserName=${API_USER}&ClientIp=${CLIENT_IP}&Command=namecheap.domains.check&DomainList=${domain}`;

  try {
    const response = await fetch(url);
    const xml = await response.text();

    // Basic XML parse: look for Available="true"
    const available = xml.includes('Available="true"');
    res.status(200).json({ domain, available });
  } catch (err: any) {
    res.status(500).json({ error: "Namecheap lookup failed", details: err.message });
  }
}
