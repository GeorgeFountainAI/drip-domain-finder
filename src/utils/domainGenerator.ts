// Domain generation utility for DomainDrip.AI

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
}

const commonTlds = [
  { tld: 'com', price: 12.99 },
  { tld: 'net', price: 14.99 },
  { tld: 'org', price: 13.99 },
  { tld: 'io', price: 39.99 },
  { tld: 'co', price: 29.99 },
  { tld: 'app', price: 19.99 },
  { tld: 'dev', price: 14.99 },
  { tld: 'ai', price: 99.99 },
  { tld: 'tech', price: 24.99 },
  { tld: 'pro', price: 19.99 },
];

const prefixes = [
  'get', 'my', 'the', 'go', 'use', 'try', 'super', 'mega', 'ultra',
  'best', 'top', 'pro', 'quick', 'fast', 'smart', 'easy', 'simple',
  'new', 'next', 'modern', 'future', 'digital', 'tech', 'cloud',
  'web', 'online', 'virtual', 'cyber', 'meta', 'nano', 'micro',
];

const suffixes = [
  'hub', 'lab', 'zone', 'spot', 'box', 'kit', 'tool', 'way', 'path',
  'link', 'bridge', 'gate', 'port', 'base', 'core', 'stack', 'deck',
  'board', 'room', 'space', 'place', 'site', 'page', 'docs', 'wiki',
  'guide', 'help', 'tips', 'hacks', 'tricks', 'secrets', 'magic',
  'shift', 'flow', 'pilot', 'verse', 'scope', 'sync', 'wave', 'boost',
];

// Brand-style pattern generators for wildcard suggestions
const brandPatterns = [
  'get{keyword}', '{keyword}shift', '{keyword}pilot', '{keyword}flow',
  '{keyword}hub', '{keyword}lab', '{keyword}scope', '{keyword}sync',
  'my{keyword}', 'use{keyword}', 'try{keyword}', '{keyword}wave',
  '{keyword}boost', '{keyword}verse', 'super{keyword}', '{keyword}pro',
];

const alternatives = [
  'app', 'apps', 'tool', 'tools', 'kit', 'kits', 'box', 'boxes',
  'hub', 'hubs', 'lab', 'labs', 'studio', 'studios', 'works', 'pro',
  'plus', 'max', 'go', 'now', 'today', 'quick', 'fast', 'easy',
  'simple', 'smart', 'best', 'top', 'super', 'mega', 'ultra',
];

// Mock availability check (in real app, this would call Namecheap API)
const mockAvailabilityCheck = (domain: string): boolean => {
  // Simulate random availability with some domains being more likely available
  const hash = domain.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Make shorter domains less likely to be available
  const lengthFactor = Math.max(0.2, Math.min(0.8, (domain.length - 3) / 10));
  const baseProbability = 0.6 * lengthFactor;
  
  return Math.abs(hash) % 100 < baseProbability * 100;
};

const generateDomainVariations = (keyword: string): string[] => {
  const variations = new Set<string>();
  const baseKeyword = keyword.replace(/\*/g, '').toLowerCase();
  
  // Handle wildcard patterns
  if (keyword.includes('*')) {
    if (keyword.startsWith('*')) {
      // *keyword pattern
      const suffix = keyword.substring(1);
      prefixes.forEach(prefix => {
        variations.add(prefix + suffix);
      });
    } else if (keyword.endsWith('*')) {
      // keyword* pattern
      const prefix = keyword.substring(0, keyword.length - 1);
      suffixes.forEach(suffix => {
        variations.add(prefix + suffix);
      });
      alternatives.forEach(alt => {
        variations.add(prefix + alt);
      });
    } else if (keyword.includes('*')) {
      // key*word pattern
      const parts = keyword.split('*');
      const prefix = parts[0];
      const suffix = parts[1];
      
      // Generate combinations
      ['', 'app', 'hub', 'lab', 'kit', 'box', 'pro', 'go', 'my', 'get'].forEach(middle => {
        variations.add(prefix + middle + suffix);
      });
    }
  } else {
    // Regular keyword - generate variations
    variations.add(baseKeyword);
    
    // Add prefixes
    prefixes.slice(0, 8).forEach(prefix => {
      variations.add(prefix + baseKeyword);
    });
    
    // Add suffixes
    suffixes.slice(0, 8).forEach(suffix => {
      variations.add(baseKeyword + suffix);
    });
    
    // Add alternatives
    alternatives.slice(0, 6).forEach(alt => {
      variations.add(baseKeyword + alt);
    });
  }
  
  return Array.from(variations).filter(v => v.length >= 3 && v.length <= 20);
};

export const generateDomains = async (keyword: string): Promise<Domain[]> => {
  const variations = generateDomainVariations(keyword);
  const domains: Domain[] = [];
  
  // Generate domains for each variation with different TLDs
  variations.forEach(variation => {
    // Prioritize common TLDs for each variation
    const selectedTlds = commonTlds.slice(0, Math.random() > 0.5 ? 3 : 2);
    
    selectedTlds.forEach(({ tld, price }) => {
      const domainName = `${variation}.${tld}`;
      const available = mockAvailabilityCheck(variation + tld);
      
      domains.push({
        name: domainName,
        available,
        price: price + (Math.random() - 0.5) * 2, // Add small price variation
        tld,
      });
    });
  });
  
  // Sort by availability first, then by price
  return domains.sort((a, b) => {
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    return a.price - b.price;
  });
};

// Generate wildcard brand-style suggestions
export const generateWildcardSuggestions = (keyword: string): string[] => {
  const baseKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
  const suggestions = new Set<string>();
  
  // Apply brand patterns
  brandPatterns.forEach(pattern => {
    const suggestion = pattern.replace('{keyword}', baseKeyword);
    if (suggestion.length >= 3 && suggestion.length <= 20) {
      suggestions.add(suggestion);
    }
  });
  
  return Array.from(suggestions).slice(0, 8);
};

// Generate TLD variations for a base domain name
export const generateTldVariations = async (baseName: string): Promise<Domain[]> => {
  const tldVariations: Domain[] = [];
  
  // Use all common TLDs for TLD swapper
  commonTlds.forEach(({ tld, price }) => {
    const domainName = `${baseName}.${tld}`;
    const available = mockAvailabilityCheck(baseName + tld);
    
    tldVariations.push({
      name: domainName,
      available,
      price: price + (Math.random() - 0.5) * 2,
      tld,
    });
  });
  
  return tldVariations.sort((a, b) => {
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    return a.price - b.price;
  });
};

export const searchDomains = async (keyword: string): Promise<Domain[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const domains = await generateDomains(keyword);
  
  // Return a reasonable number of results
  return domains.slice(0, 24);
};