/**
 * Comprehensive test data for domain availability scenarios
 * Covers edge cases, real registered domains, and expected behaviors
 */

export interface DomainTestCase {
  name: string;
  available: boolean;
  price?: number;
  tld: string;
  flipScore?: number;
  spaceshipResponse?: any;
  rdapResponse?: any;
  expectedInResults: boolean;
  expectedBuyButton: boolean;
  expectedLogEntry?: {
    source: string;
    status: string;
    message: string;
  };
}

// Known registered domains that should NEVER appear as available
export const REGISTERED_DOMAINS: DomainTestCase[] = [
  {
    name: 'getsupermind.com',
    available: false,
    tld: 'com',
    expectedInResults: false,
    expectedBuyButton: false,
    spaceshipResponse: { available: false, status: 'taken', registered: true },
    rdapResponse: { status: ['client hold'], objectClassName: 'domain' },
    expectedLogEntry: {
      source: 'spaceship',
      status: 'unavailable',
      message: 'Spaceship API marked unavailable'
    }
  },
  {
    name: 'google.com',
    available: false,
    tld: 'com',
    expectedInResults: false,
    expectedBuyButton: false,
    spaceshipResponse: { available: false, status: 'registered' },
    rdapResponse: { status: ['client delete prohibited', 'client transfer prohibited'] }
  },
  {
    name: 'facebook.com',
    available: false,
    tld: 'com',
    expectedInResults: false,
    expectedBuyButton: false,
    spaceshipResponse: { available: false, registered: true }
  }
];

// Available domains that should appear with buy buttons
export const AVAILABLE_DOMAINS: DomainTestCase[] = [
  {
    name: 'unique-test-domain-12345.com',
    available: true,
    price: 12.99,
    tld: 'com',
    flipScore: 75,
    expectedInResults: true,
    expectedBuyButton: true,
    spaceshipResponse: { available: true, status: null, price: 12.99 },
    rdapResponse: null // 404 response indicates not registered
  },
  {
    name: 'another-available-domain.net',
    available: true,
    price: 15.99,
    tld: 'net',
    flipScore: 68,
    expectedInResults: true,
    expectedBuyButton: true,
    spaceshipResponse: { available: true, price: 15.99 }
  }
];

// Edge cases and conflict scenarios
export const EDGE_CASE_DOMAINS: DomainTestCase[] = [
  {
    name: 'spaceship-says-available-rdap-says-taken.com',
    available: false, // Should be false after RDAP override
    tld: 'com',
    expectedInResults: false,
    expectedBuyButton: false,
    spaceshipResponse: { available: true, price: 12.99 },
    rdapResponse: { status: ['active', 'ok'] }, // Active = registered
    expectedLogEntry: {
      source: 'rdap',
      status: 'mismatch',
      message: 'Spaceship marked available but RDAP shows registered'
    }
  },
  {
    name: 'malformed-api-response.com',
    available: false,
    tld: 'com',
    expectedInResults: false,
    expectedBuyButton: false,
    spaceshipResponse: { /* missing available field */ },
    expectedLogEntry: {
      source: 'spaceship',
      status: 'error',
      message: 'API request failed or malformed response'
    }
  },
  {
    name: 'rdap-timeout.com',
    available: false, // Default to unavailable on RDAP failure
    tld: 'com',
    expectedInResults: false,
    expectedBuyButton: false,
    spaceshipResponse: { available: true },
    rdapResponse: 'TIMEOUT',
    expectedLogEntry: {
      source: 'rdap',
      status: 'error',
      message: 'RDAP exception: timeout'
    }
  }
];

// Buy link test scenarios
export const BUY_LINK_SCENARIOS = [
  {
    domain: 'available-domain.com',
    cartUrlStatus: 200,
    searchUrlStatus: 200,
    expectedResult: { ok: true }
  },
  {
    domain: 'cart-404-search-ok.com',
    cartUrlStatus: 404,
    searchUrlStatus: 200,
    expectedResult: { ok: true } // Should fallback to search URL
  },
  {
    domain: 'both-urls-404.com',
    cartUrlStatus: 404,
    searchUrlStatus: 404,
    expectedResult: { ok: false, error: '404' },
    expectedLogEntry: {
      source: 'buy_link',
      status: '404',
      message: 'Both cart and search URLs returned 404'
    }
  }
];

// FlipScore test cases
export const FLIP_SCORE_TEST_CASES = [
  {
    domain: 'ai.com',
    expectedScore: 95, // Short + premium TLD + trending keyword
    scoreRange: [90, 100]
  },
  {
    domain: 'verylongdomainnamethatistoohardtoremember.com',
    expectedScore: 25, // Too long, hard to remember
    scoreRange: [20, 35]
  },
  {
    domain: 'app-hub.com',
    expectedScore: 72, // Good length, trending keywords
    scoreRange: [65, 80]
  },
  {
    domain: 'test123.xyz',
    expectedScore: 35, // Numbers + low-value TLD
    scoreRange: [30, 45]
  }
];

// Search query test scenarios
export const SEARCH_SCENARIOS = [
  {
    query: 'ai startup',
    expectedKeywords: ['ai', 'startup', 'getai', 'aihub', 'myai'],
    expectedTlds: ['com', 'ai', 'io', 'app'],
    minResults: 5,
    maxResults: 15
  },
  {
    query: 'fitness app',
    expectedKeywords: ['fitness', 'app', 'getfitness', 'fitnessapp'],
    expectedTlds: ['com', 'app', 'fit'],
    minResults: 3,
    maxResults: 15
  },
  {
    query: '',
    expectedResults: 0,
    expectedError: 'Keyword is required'
  }
];

// Logging validation scenarios
export const LOG_VALIDATION_SCENARIOS = [
  {
    name: 'No duplicate logs for same domain',
    domain: 'test-domain.com',
    logEntries: [
      { source: 'spaceship', status: 'error', message: 'First error' },
      { source: 'spaceship', status: 'error', message: 'Second error same day' }
    ],
    expectedCount: 2 // Should log both entries
  },
  {
    name: 'Structured log fields validation',
    requiredFields: ['domain', 'source', 'status', 'message', 'created_at'],
    optionalFields: ['id']
  }
];

export const ALL_TEST_DOMAINS = [
  ...REGISTERED_DOMAINS,
  ...AVAILABLE_DOMAINS, 
  ...EDGE_CASE_DOMAINS
];