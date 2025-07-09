// server/namecheap.js
import axios from 'axios';

export async function searchDomains(keyword) {
  const username = process.env.NAMECHEAP_API_USER;
  const apiKey = process.env.NAMECHEAP_API_KEY;
  const url = process.env.NAMECHEAP_API_URL || 'https://api.sandbox.namecheap.com/xml.response';

  const params = {
    ApiUser: username,
    ApiKey: apiKey,
    UserName: username,
    ClientIp: '127.0.0.1', // Must match your whitelisted IP
    Command: 'namecheap.domains.check',
    DomainList: keyword
  };

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (err) {
    console.error('Error searching domains:', err.message);
    return { error: err.message };
  }
}
