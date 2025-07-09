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

export async function registerDomain(domainName) {
  const username = process.env.NAMECHEAP_API_USER;
  const apiKey = process.env.NAMECHEAP_API_KEY;
  const url = process.env.NAMECHEAP_API_URL || 'https://api.sandbox.namecheap.com/xml.response';

  const params = {
    ApiUser: username,
    ApiKey: apiKey,
    UserName: username,
    ClientIp: '127.0.0.1', // Must match your whitelisted IP
    Command: 'namecheap.domains.create',
    DomainName: domainName,
    Years: 1,
    // Required registrant information - using placeholder values for demo
    // In a real implementation, these would come from user input
    RegistrantFirstName: 'John',
    RegistrantLastName: 'Doe',
    RegistrantAddress1: '123 Main St',
    RegistrantCity: 'New York',
    RegistrantStateProvince: 'NY',
    RegistrantPostalCode: '10001',
    RegistrantCountry: 'US',
    RegistrantPhone: '+1.5551234567',
    RegistrantEmailAddress: 'john.doe@example.com',
    // Use same info for tech, admin, and aux billing contacts
    TechFirstName: 'John',
    TechLastName: 'Doe',
    TechAddress1: '123 Main St',
    TechCity: 'New York',
    TechStateProvince: 'NY',
    TechPostalCode: '10001',
    TechCountry: 'US',
    TechPhone: '+1.5551234567',
    TechEmailAddress: 'john.doe@example.com',
    AdminFirstName: 'John',
    AdminLastName: 'Doe',
    AdminAddress1: '123 Main St',
    AdminCity: 'New York',
    AdminStateProvince: 'NY',
    AdminPostalCode: '10001',
    AdminCountry: 'US',
    AdminPhone: '+1.5551234567',
    AdminEmailAddress: 'john.doe@example.com',
    AuxBillingFirstName: 'John',
    AuxBillingLastName: 'Doe',
    AuxBillingAddress1: '123 Main St',
    AuxBillingCity: 'New York',
    AuxBillingStateProvince: 'NY',
    AuxBillingPostalCode: '10001',
    AuxBillingCountry: 'US',
    AuxBillingPhone: '+1.5551234567',
    AuxBillingEmailAddress: 'john.doe@example.com'
  };

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (err) {
    console.error('Error registering domain:', err.message);
    return { error: err.message };
  }
}

export async function registerMultipleDomains(domains) {
  const results = [];
  
  for (const domain of domains) {
    try {
      const result = await registerDomain(domain);
      
      // Mock response for demonstration - in real app, parse XML response
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      results.push({
        domain: domain,
        success: success,
        message: success ? 'Domain registered successfully' : 'Registration failed - domain may be unavailable or API error'
      });
    } catch (error) {
      results.push({
        domain: domain,
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }
  
  return results;
}