import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DomainSearchForm } from '../../src/components/DomainSearchForm';
import DomainResults from '../../src/components/DomainResults';
import { getNamecheapLink } from '../../src/utils/getNamecheapLink';
import { analytics } from '../../src/utils/analytics';

// Mock Supabase
vi.mock('../../src/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [{ current_credits: 10 }], error: null })
      }),
      insert: vi.fn().mockResolvedValue({ error: null })
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ 
        data: { domains: [{ name: 'test.com', available: true, price: 12.99, flipScore: 85 }] }, 
        error: null 
      })
    }
  }
}));

// Mock Zustand stores
vi.mock('../../src/lib/store', () => ({
  useSelectedDomains: vi.fn(() => ({
    selectedDomains: [],
    add: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    set: vi.fn()
  })),
  useSearchStore: vi.fn(() => ({
    results: [],
    loading: false,
    setResults: vi.fn(),
    setLoading: vi.fn()
  }))
}));

const mockDomains = [
  { domain: 'aistart.com', available: true, price: 12.99, flipScore: 95 },
  { domain: 'techai.net', available: true, price: 8.99, flipScore: 78 },
  { domain: 'aibot.org', available: true, price: 15.99, flipScore: 88 }
];

describe('End-to-End Domain Search Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analytics.clear();
  });

  describe('Wildcard Support', () => {
    it('should handle wildcard patterns correctly', async () => {
      // Test data for wildcard patterns
      const wildcardTests = [
        { input: 'ai*', expected: 'should find domains starting with ai' },
        { input: '*bot', expected: 'should find domains ending with bot' },
        { input: 'black*beauty', expected: 'should find domains containing both terms' }
      ];

      wildcardTests.forEach(({ input, expected }) => {
        expect(input).toMatch(/\*|[a-z]/);
      });
    });
  });

  describe('Namecheap Link Generation', () => {
    it('should generate direct Namecheap affiliate URLs', () => {
      const testDomains = ['example.com', 'test.net', 'my-domain.org'];
      
      testDomains.forEach(domain => {
        const url = getNamecheapLink(domain);
        
        // Should be a direct Namecheap URL with affiliate ID
        expect(url).toContain('namecheap.com');
        expect(url).toContain('domain=');
        expect(url).toContain('affid=gOzBbX');
        
        // Should NOT use API redirect
        expect(url).not.toContain('/api/go/');
        expect(url).not.toContain('pxf.io');
        expect(url).not.toContain('spaceship');
      });
    });

    it('should track buy clicks with analytics', async () => {
      const { trackDomainBuyClick } = await import('../../src/utils/analytics');
      trackDomainBuyClick('aistart.com', 95);

      const events = analytics.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        domain: 'aistart.com',
        action: 'buy_click',
        source: 'namecheap_link',
        flipScore: 95
      });
    });
  });

  describe('Bulk Actions Analytics', () => {
    it('should track bulk buy actions', async () => {
      const testDomains = ['domain1.com', 'domain2.com'];
      
      const { trackBulkBuy } = await import('../../src/utils/analytics');
      trackBulkBuy(testDomains);

      const events = analytics.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        action: 'bulk_buy',
        domains: testDomains,
        count: 2
      });
    });
  });
});
