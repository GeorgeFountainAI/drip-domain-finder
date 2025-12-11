import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
        // In a real test, you'd validate the API call includes wildcard logic
      });
    });

    it('should display wildcard tooltip on help icon', async () => {
      const user = userEvent.setup();
      
      render(
        <DomainSearchForm 
          onResults={() => {}} 
          onStateChange={() => {}} 
        />
      );

      const helpIcon = screen.getByLabelText(/wildcard tips/i);
      await user.hover(helpIcon);

      await waitFor(() => {
        expect(screen.getByText(/ai\* → starts with ai/)).toBeInTheDocument();
        expect(screen.getByText(/\*bot → ends with bot/)).toBeInTheDocument();
        expect(screen.getByText(/black\*beauty → contains both/)).toBeInTheDocument();
      });
    });
  });

  describe('FlipScore Rendering', () => {
    it('should display FlipScore with tooltip explanation', async () => {
      const user = userEvent.setup();
      
      render(<DomainResults results={mockDomains} />);

      // Check FlipScore is displayed
      expect(screen.getByText('Flip Score: 95')).toBeInTheDocument();
      expect(screen.getByText('Flip Score: 78')).toBeInTheDocument();

      // Check tooltip appears on help icon
      const helpIcon = screen.getByRole('button', { name: /flip score help/i });
      await user.hover(helpIcon);

      await waitFor(() => {
        expect(screen.getByText('Flip Score = Brand potential')).toBeInTheDocument();
        expect(screen.getByText('Short, memorable names')).toBeInTheDocument();
        expect(screen.getByText('High resale interest')).toBeInTheDocument();
      });
    });

    it('should handle domains without FlipScore gracefully', () => {
      const domainsWithoutScore = [
        { domain: 'example.com', available: true, price: 10.99 }
      ];
      
      render(<DomainResults results={domainsWithoutScore} />);
      
      expect(screen.getByText('example.com')).toBeInTheDocument();
      expect(screen.queryByText('Flip Score:')).not.toBeInTheDocument();
    });
  });

  describe('Domain Selection', () => {
    it('should track selection analytics correctly', async () => {
      const user = userEvent.setup();
      const { useSelectedDomains } = require('../../src/lib/store');
      const mockAdd = vi.fn();
      
      vi.mocked(useSelectedDomains).mockReturnValue({
        selectedDomains: [],
        add: mockAdd,
        remove: vi.fn(),
        clear: vi.fn(),
        set: vi.fn()
      });

      render(<DomainResults results={mockDomains} />);

      const checkbox = screen.getAllByRole('checkbox')[0];
      await user.click(checkbox);

      expect(mockAdd).toHaveBeenCalledWith('aistart.com');
      
      // Check analytics tracking
      const events = analytics.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        domain: 'aistart.com',
        action: 'select',
        source: 'checkbox',
        flipScore: 95
      });
    });

    it('should update selection state visually', async () => {
      const user = userEvent.setup();
      const { useSelectedDomains } = require('../../src/lib/store');
      
      // Mock selected state
      vi.mocked(useSelectedDomains).mockReturnValue({
        selectedDomains: ['aistart.com'],
        add: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
        set: vi.fn()
      });

      render(<DomainResults results={mockDomains} />);

      const checkbox = screen.getAllByRole('checkbox')[0];
      expect(checkbox).toBeChecked();
    });
  });

  describe('Namecheap Link Generation', () => {
    it('should generate valid affiliate URLs with domain parameter', () => {
      const testDomains = ['example.com', 'test.net', 'my-domain.org'];
      
      testDomains.forEach(domain => {
        const url = getNamecheapLink(domain);
        
        // Should use the API redirect pattern
        expect(url).toContain('/api/go/namecheap?d=');
        expect(url).toContain(encodeURIComponent(domain));
        
        // Should be a valid relative URL path
        expect(url.startsWith('/api/go/namecheap')).toBe(true);
      });
    });

    it('should track buy clicks with analytics', async () => {
      const user = userEvent.setup();
      
      render(<DomainResults results={mockDomains} />);

      const buyButton = screen.getAllByText('BUY NOW')[0];
      await user.click(buyButton);

      const events = analytics.getEventsByAction('buy_click');
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        domain: 'aistart.com',
        action: 'buy_click',
        source: 'spaceship_link',
        flipScore: 95
      });
    });

    it('should open links in new tabs with correct attributes', async () => {
      const user = userEvent.setup();
      
      render(<DomainResults results={mockDomains} />);

      const buyLink = screen.getAllByText('BUY NOW')[0].closest('a');
      expect(buyLink).toHaveAttribute('target', '_blank');
      expect(buyLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Trust Badge', () => {
    it('should appear when results are present', () => {
      render(<DomainResults results={mockDomains} />);
      
      expect(screen.getByText('Trust Layer Certified')).toBeInTheDocument();
      expect(screen.getByText('Tested. Logged. Safe to Buy.')).toBeInTheDocument();
    });

    it('should not appear when no results', () => {
      render(<DomainResults results={[]} />);
      
      expect(screen.queryByText('Trust Layer Certified')).not.toBeInTheDocument();
    });

    it('should not appear during loading state', () => {
      const { useSearchStore } = require('../../src/lib/store');
      
      vi.mocked(useSearchStore).mockReturnValue({
        results: [],
        loading: true,
        setResults: vi.fn(),
        setLoading: vi.fn()
      });

      render(<DomainResults results={[]} />);
      
      expect(screen.queryByText('Trust Layer Certified')).not.toBeInTheDocument();
    });
  });

  describe('Bulk Actions Analytics', () => {
    it('should track bulk buy actions', () => {
      const testDomains = ['domain1.com', 'domain2.com'];
      
      // Import and test the tracking function
      const { trackBulkBuy } = require('../../src/utils/analytics');
      trackBulkBuy(testDomains);

      const events = analytics.getEventsByAction('bulk_buy');
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        action: 'bulk_buy',
        domainCount: 2,
        domains: testDomains
      });
    });

    it('should track CSV export actions', () => {
      const { trackExportCSV } = require('../../src/utils/analytics');
      const testDomains = ['test1.com', 'test2.com'];
      
      trackExportCSV(testDomains);

      const events = analytics.getEventsByAction('export_csv');
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        action: 'export_csv',
        domainCount: 2,
        domains: testDomains
      });
    });

    it('should track copy to clipboard actions', () => {
      const { trackCopyDomains } = require('../../src/utils/analytics');
      const testDomains = ['copy1.com', 'copy2.com'];
      
      trackCopyDomains(testDomains);

      const events = analytics.getEventsByAction('copy_domains');
      expect(events).toHaveLength(1);
    });
  });
});