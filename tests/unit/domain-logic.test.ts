import { describe, it, expect, vi } from 'vitest';
import { FLIP_SCORE_TEST_CASES, EDGE_CASE_DOMAINS, AVAILABLE_DOMAINS } from '../test-data/domain-scenarios';

// Import the functions we need to test
// These would normally be extracted to separate utility files
function calculateFlipScore(domainName: string): number {
  const name = domainName.split('.')[0];
  const tld = domainName.split('.')[1];
  
  let score = 30; // Base score
  
  // Length factor (shorter is generally better for brandability)
  if (name.length <= 4) score += 30;
  else if (name.length <= 6) score += 25;
  else if (name.length <= 8) score += 15;
  else if (name.length <= 10) score += 5;
  else if (name.length > 15) score -= 20;
  
  // TLD popularity and market value
  const tldScores: { [key: string]: number } = {
    'com': 30, 'net': 15, 'org': 12, 'io': 25, 'ai': 28,
    'app': 20, 'dev': 18, 'tech': 15, 'co': 12, 'xyz': 5,
    'online': 8, 'store': 10, 'shop': 12, 'biz': 6, 'info': 4
  };
  score += tldScores[tld] || 5;
  
  // Brandability factors
  if (!/[-0-9]/.test(name)) score += 15; // No hyphens or numbers
  if (/^[a-z]+$/.test(name)) score += 5; // Only letters
  
  // Pronounceable and memorable
  const vowels = (name.match(/[aeiou]/g) || []).length;
  const consonants = name.length - vowels;
  if (vowels > 0 && consonants > 0 && vowels / name.length >= 0.2) score += 10;
  
  // Trending keywords boost
  const trendKeywords = ['ai', 'app', 'tech', 'hub', 'pro', 'get', 'my', 'smart', 'digital', 'crypto', 'nft', 'meta'];
  const keywordMatches = trendKeywords.filter(keyword => name.toLowerCase().includes(keyword)).length;
  score += Math.min(15, keywordMatches * 5);
  
  // Common word penalty (too generic)
  const commonWords = ['the', 'and', 'but', 'for', 'with', 'this', 'that', 'from', 'they', 'know', 'want'];
  if (commonWords.some(word => name.toLowerCase().includes(word))) score -= 10;
  
  // Ensure score is within bounds
  return Math.max(1, Math.min(100, Math.round(score)));
}

function isDomainAvailable(spaceshipData: any): boolean {
  if (!spaceshipData) return false;
  
  return spaceshipData.available === true && 
         (!spaceshipData.status || 
          (spaceshipData.status.toLowerCase() !== 'taken' && 
           spaceshipData.status.toLowerCase() !== 'registered')) &&
         spaceshipData.registered !== true;
}

function shouldShowBuyButton(domain: { available: boolean; name: string }): boolean {
  if (!domain.available) return false;
  
  // Additional checks could go here
  return true;
}

function parseSpaceshipResponse(response: any): { available: boolean; price?: number; error?: string } {
  try {
    if (!response || typeof response !== 'object') {
      return { available: false, error: 'Invalid response format' };
    }
    
    const available = isDomainAvailable(response);
    return {
      available,
      price: response.price || null,
      error: available ? undefined : 'Domain not available'
    };
  } catch (error) {
    return { available: false, error: `Parse error: ${error.message}` };
  }
}

describe('Domain Logic - Unit Tests', () => {
  
  describe('FlipScore Calculation', () => {
    FLIP_SCORE_TEST_CASES.forEach(testCase => {
      it(`should calculate correct FlipScore for ${testCase.domain}`, () => {
        const score = calculateFlipScore(testCase.domain);
        
        expect(score).toBeGreaterThanOrEqual(testCase.scoreRange[0]);
        expect(score).toBeLessThanOrEqual(testCase.scoreRange[1]);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
    
    it('should penalize very long domains', () => {
      const longDomain = 'verylongdomainnamethatistoohardtorememberandtype.com';
      const shortDomain = 'ai.com';
      
      const longScore = calculateFlipScore(longDomain);
      const shortScore = calculateFlipScore(shortDomain);
      
      expect(shortScore).toBeGreaterThan(longScore);
    });
    
    it('should boost trending keywords', () => {
      const aiDomain = calculateFlipScore('myai.com');
      const genericDomain = calculateFlipScore('mytest.com');
      
      expect(aiDomain).toBeGreaterThan(genericDomain);
    });
    
    it('should prefer premium TLDs', () => {
      const comDomain = calculateFlipScore('startup.com');
      const xyzDomain = calculateFlipScore('startup.xyz');
      
      expect(comDomain).toBeGreaterThan(xyzDomain);
    });
  });
  
  describe('Domain Availability Parsing', () => {
    it('should correctly identify available domains', () => {
      const availableResponse = { available: true, status: null, price: 12.99 };
      expect(isDomainAvailable(availableResponse)).toBe(true);
    });
    
    it('should correctly identify taken domains', () => {
      const takenResponse = { available: false, status: 'taken', price: 12.99 };
      expect(isDomainAvailable(takenResponse)).toBe(false);
    });
    
    it('should correctly identify registered domains', () => {
      const registeredResponse = { available: false, status: 'registered', registered: true };
      expect(isDomainAvailable(registeredResponse)).toBe(false);
    });
    
    it('should handle edge case: available=true but status=taken', () => {
      const conflictResponse = { available: true, status: 'taken' };
      expect(isDomainAvailable(conflictResponse)).toBe(false);
    });
    
    it('should handle malformed responses', () => {
      expect(isDomainAvailable(null)).toBe(false);
      expect(isDomainAvailable({})).toBe(false);
      expect(isDomainAvailable({ random: 'data' })).toBe(false);
    });
    
    EDGE_CASE_DOMAINS.forEach(testCase => {
      it(`should handle edge case: ${testCase.name}`, () => {
        const result = parseSpaceshipResponse(testCase.spaceshipResponse);
        expect(result.available).toBe(testCase.available);
      });
    });
  });
  
  describe('Buy Button Logic', () => {
    it('should show buy button for available domains', () => {
      AVAILABLE_DOMAINS.forEach(domain => {
        expect(shouldShowBuyButton(domain)).toBe(domain.expectedBuyButton);
      });
    });
    
    it('should not show buy button for unavailable domains', () => {
      const unavailableDomain = { available: false, name: 'taken.com' };
      expect(shouldShowBuyButton(unavailableDomain)).toBe(false);
    });
  });
  
  describe('Domain Name Validation', () => {
    it('should validate proper domain format', () => {
      const validDomains = ['example.com', 'test-domain.net', 'my123.io'];
      const invalidDomains = ['', 'nodot', '.com', 'too..many.dots.com'];
      
      validDomains.forEach(domain => {
        expect(domain).toMatch(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
      });
      
      invalidDomains.forEach(domain => {
        expect(domain).not.toMatch(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
      });
    });
  });
  
  describe('Price Validation', () => {
    it('should handle missing or invalid prices', () => {
      const responses = [
        { available: true, price: null },
        { available: true, price: undefined },
        { available: true, price: 'invalid' },
        { available: true, price: -5 }
      ];
      
      responses.forEach(response => {
        const result = parseSpaceshipResponse(response);
        if (result.available) {
          expect(result.price).toBeNull();
        }
      });
    });
    
    it('should preserve valid prices', () => {
      const response = { available: true, price: 12.99 };
      const result = parseSpaceshipResponse(response);
      expect(result.price).toBe(12.99);
    });
  });
  
});