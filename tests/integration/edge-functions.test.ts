import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { 
  REGISTERED_DOMAINS, 
  AVAILABLE_DOMAINS, 
  EDGE_CASE_DOMAINS,
  BUY_LINK_SCENARIOS,
  SEARCH_SCENARIOS 
} from '../test-data/domain-scenarios';

// Test environment setup
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nfzmnkpepfrubjpifnna.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

let supabase: any;

// Mock external APIs for controlled testing
const mockSpaceshipAPI = vi.fn();
const mockRDAPAPI = vi.fn();

describe('Integration Tests - Edge Functions', () => {
  
  beforeAll(async () => {
    if (!SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_ANON_KEY required for integration tests');
    }
    
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Setup API mocks
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('spaceship.com/api')) {
        return mockSpaceshipAPI(url);
      }
      if (url.includes('rdap.org')) {
        return mockRDAPAPI(url);
      }
      return Promise.reject(new Error(`Unmocked URL: ${url}`));
    });
  });
  
  afterAll(() => {
    vi.restoreAllMocks();
  });
  
  describe('spaceship-domain-search Function', () => {
    
    it('should return only available domains', async () => {
      // Mock Spaceship API to return mixed availability
      mockSpaceshipAPI.mockImplementation((url: string) => {
        const domain = new URL(url).searchParams.get('domain');
        const testDomain = [...AVAILABLE_DOMAINS, ...REGISTERED_DOMAINS]
          .find(d => d.name === domain);
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(testDomain?.spaceshipResponse || { available: false })
        });
      });
      
      // Mock RDAP API 
      mockRDAPAPI.mockImplementation((url: string) => {
        const domain = url.split('/').pop();
        const testDomain = [...AVAILABLE_DOMAINS, ...REGISTERED_DOMAINS]
          .find(d => d.name === domain);
        
        if (!testDomain?.rdapResponse) {
          return Promise.resolve({ status: 404 }); // Not registered
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(testDomain.rdapResponse)
        });
      });
      
      const response = await supabase.functions.invoke('spaceship-domain-search', {
        body: { keyword: 'test' }
      });
      
      expect(response.error).toBeNull();
      expect(response.data.domains).toBeDefined();
      
      // All returned domains should be available
      response.data.domains.forEach((domain: any) => {
        expect(domain.available).toBe(true);
      });
    });
    
    it('should exclude registered domains like getsupermind.com', async () => {
      mockSpaceshipAPI.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ available: false, status: 'taken' })
        })
      );
      
      const response = await supabase.functions.invoke('spaceship-domain-search', {
        body: { keyword: 'getsupermind' }
      });
      
      expect(response.error).toBeNull();
      
      // getsupermind.com should not be in results
      const hasGetsupermind = response.data.domains?.some(
        (domain: any) => domain.name === 'getsupermind.com'
      );
      expect(hasGetsupermind).toBe(false);
    });
    
    it('should handle RDAP conflicts correctly', async () => {
      const conflictDomain = EDGE_CASE_DOMAINS.find(d => 
        d.name === 'spaceship-says-available-rdap-says-taken.com'
      );
      
      if (!conflictDomain) return;
      
      mockSpaceshipAPI.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(conflictDomain.spaceshipResponse)
        })
      );
      
      mockRDAPAPI.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(conflictDomain.rdapResponse)
        })
      );
      
      const response = await supabase.functions.invoke('spaceship-domain-search', {
        body: { keyword: 'spaceship-says-available-rdap-says-taken' }
      });
      
      expect(response.error).toBeNull();
      
      // Domain should not appear in results due to RDAP override
      const hasConflictDomain = response.data.domains?.some(
        (domain: any) => domain.name === conflictDomain.name
      );
      expect(hasConflictDomain).toBe(false);
    });
    
    it('should require keyword parameter', async () => {
      const response = await supabase.functions.invoke('spaceship-domain-search', {
        body: {}
      });
      
      expect(response.data.error).toBe('Keyword is required');
    });
    
    it('should limit results to reasonable number', async () => {
      mockSpaceshipAPI.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ available: true, price: 12.99 })
        })
      );
      
      mockRDAPAPI.mockImplementation(() =>
        Promise.resolve({ status: 404 })
      );
      
      const response = await supabase.functions.invoke('spaceship-domain-search', {
        body: { keyword: 'popular' }
      });
      
      expect(response.error).toBeNull();
      expect(response.data.domains.length).toBeLessThanOrEqual(15);
    });
    
    SEARCH_SCENARIOS.forEach(scenario => {
      it(`should handle search scenario: "${scenario.query}"`, async () => {
        if (scenario.expectedError) {
          const response = await supabase.functions.invoke('spaceship-domain-search', {
            body: { keyword: scenario.query }
          });
          expect(response.data.error).toBe(scenario.expectedError);
          return;
        }
        
        mockSpaceshipAPI.mockImplementation(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ available: true, price: 12.99 })
          })
        );
        
        const response = await supabase.functions.invoke('spaceship-domain-search', {
          body: { keyword: scenario.query }
        });
        
        expect(response.error).toBeNull();
        expect(response.data.domains.length).toBeGreaterThanOrEqual(scenario.minResults || 0);
        expect(response.data.domains.length).toBeLessThanOrEqual(scenario.maxResults || 20);
      });
    });
  });
  
  describe('validate-buy-link Function', () => {
    
    BUY_LINK_SCENARIOS.forEach(scenario => {
      it(`should handle buy link scenario: ${scenario.domain}`, async () => {
        // Mock fetch for Spaceship URLs
        global.fetch = vi.fn().mockImplementation((url: string) => {
          if (url.includes('spaceship.com') && url.includes('domain-registration')) {
            return Promise.resolve({ 
              status: scenario.cartUrlStatus,
              ok: scenario.cartUrlStatus === 200 
            });
          }
          if (url.includes('spaceship.com') && url.includes('domain-search')) {
            return Promise.resolve({ 
              status: scenario.searchUrlStatus,
              ok: scenario.searchUrlStatus === 200 
            });
          }
          return Promise.reject(new Error('Unmocked URL'));
        });
        
        const response = await supabase.functions.invoke('validate-buy-link', {
          body: { domain: scenario.domain }
        });
        
        expect(response.error).toBeNull();
        expect(response.data.ok).toBe(scenario.expectedResult.ok);
        
        if (scenario.expectedResult.error) {
          expect(response.data.error).toBe(scenario.expectedResult.error);
        }
      });
    });
    
    it('should require domain parameter', async () => {
      const response = await supabase.functions.invoke('validate-buy-link', {
        body: {}
      });
      
      expect(response.data.error).toBe('Domain is required');
    });
    
    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const response = await supabase.functions.invoke('validate-buy-link', {
        body: { domain: 'test.com' }
      });
      
      expect(response.error).toBeNull();
      expect(response.data.ok).toBe(false);
      expect(response.data.error).toBe('fetch_failed');
    });
  });
  
  describe('Error Handling & Resilience', () => {
    
    it('should handle Spaceship API timeouts', async () => {
      mockSpaceshipAPI.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 100)
        )
      );
      
      const response = await supabase.functions.invoke('spaceship-domain-search', {
        body: { keyword: 'timeout-test' }
      });
      
      // Should return empty results rather than error
      expect(response.error).toBeNull();
      expect(response.data.domains).toBeDefined();
    });
    
    it('should handle RDAP API failures gracefully', async () => {
      mockSpaceshipAPI.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ available: true })
        })
      );
      
      mockRDAPAPI.mockImplementation(() => 
        Promise.reject(new Error('RDAP down'))
      );
      
      const response = await supabase.functions.invoke('spaceship-domain-search', {
        body: { keyword: 'rdap-fail' }
      });
      
      expect(response.error).toBeNull();
      // Should default to unavailable when RDAP fails
      expect(response.data.domains.length).toBe(0);
    });
    
    it('should handle malformed API responses', async () => {
      mockSpaceshipAPI.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve('invalid json structure')
        })
      );
      
      const response = await supabase.functions.invoke('spaceship-domain-search', {
        body: { keyword: 'malformed' }
      });
      
      expect(response.error).toBeNull();
      expect(response.data.domains.length).toBe(0);
    });
  });
});