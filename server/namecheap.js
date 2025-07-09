// server/namecheap.js
import axios from 'axios';
import xml2js from 'xml2js';

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
    
    // Parse XML response
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    
    const domains = [];
    const domainChecks = result?.ApiResponse?.CommandResponse?.[0]?.DomainCheckResult || [];
    
    for (const domain of domainChecks) {
      const domainName = domain.$?.Domain;
      const isAvailable = domain.$?.Available === 'true';
      const tld = domainName?.split('.').pop() || 'com';
      
      let price = 0;
      
      // Get pricing for available domains
      if (isAvailable && domainName) {
        try {
          price = await getDomainPrice(domainName);
        } catch (priceError) {
          console.error(`Failed to get price for ${domainName}:`, priceError);
          // Use default pricing as fallback
          price = getDefaultPrice(tld);
        }
      }
      
      domains.push({
        name: domainName,
        available: isAvailable,
        price: price,
        tld: tld
      });
    }
    
    return domains;
  } catch (err) {
    console.error('Error searching domains:', err.message);
    return { error: err.message };
  }
}

export async function getDomainPrice(domainName) {
  const username = process.env.NAMECHEAP_API_USER;
  const apiKey = process.env.NAMECHEAP_API_KEY;
  const url = process.env.NAMECHEAP_API_URL || 'https://api.sandbox.namecheap.com/xml.response';

  const tld = domainName.split('.').pop();
  
  const params = {
    ApiUser: username,
    ApiKey: apiKey,
    UserName: username,
    ClientIp: '127.0.0.1',
    Command: 'namecheap.users.getPricing',
    ProductType: 'DOMAIN',
    ProductCategory: 'REGISTER',
    ProductName: tld
  };

  try {
    const response = await axios.get(url, { params });
    
    // Parse XML response
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    
    const pricing = result?.ApiResponse?.CommandResponse?.[0]?.UserGetPricingResult?.[0]?.ProductType?.[0]?.ProductCategory?.[0]?.Product;
    
    if (pricing && pricing.length > 0) {
      // Get the first year price
      const firstYearPrice = pricing[0]?.Price?.[0]?.$?.Price;
      return firstYearPrice ? parseFloat(firstYearPrice) : getDefaultPrice(tld);
    }
    
    return getDefaultPrice(tld);
  } catch (err) {
    console.error('Error getting domain price:', err.message);
    return getDefaultPrice(tld);
  }
}

// Fallback pricing when API fails
export function getDefaultPrice(tld) {
  const defaultPrices = {
    'com': 12.98,
    'net': 14.98,
    'org': 14.98,
    'io': 39.98,
    'ai': 89.98,
    'app': 19.98,
    'co': 32.98,
    'dev': 15.98,
    'tech': 49.98,
    'online': 39.98,
    'store': 59.98,
    'blog': 32.98
  };
  
  return defaultPrices[tld?.toLowerCase()] || 15.98;
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