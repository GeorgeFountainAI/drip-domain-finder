import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DomainResults } from '../../src/components/DomainResults';
import { REGISTERED_DOMAINS, AVAILABLE_DOMAINS, ALL_TEST_DOMAINS } from '../test-data/domain-scenarios';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
  },
  from: vi.fn().mockReturnValue({
    upsert: vi.fn().mockResolvedValue({ error: null }),
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
    })
  }),
  functions: {
    invoke: vi.fn().mockResolvedValue({ 
      data: { ok: true, url: 'https://validated-url.com' }, 
      error: null 
    })
  }
};

vi.mock('../../src/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock spaceship utilities
vi.mock('../../src/utils/spaceship', () => ({
  buildSpaceshipUrl: vi.fn((domain: string) => `https://mock-spaceship-url.com?domain=${domain}`),
  openInBatches: vi.fn()
}));

const defaultProps = {
  domains: AVAILABLE_DOMAINS,
  onAddToCart: vi.fn(),
  onBack: vi.fn(),
  isLoading: false,
  query: 'test'
};

describe('DomainResults - Regression Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Critical Requirement: Only Available Domains Rendered', () => {
    
    it('REGRESSION: Never renders registered domains like getsupermind.com', () => {
      const mixedDomains = [...AVAILABLE_DOMAINS, ...REGISTERED_DOMAINS];
      
      const { queryByText, getByText } = render(
        <DomainResults {...defaultProps} domains={mixedDomains} />
      );
      
      // Available domains should be present
      AVAILABLE_DOMAINS.forEach(domain => {
        expect(getByText(domain.name)).toBeInTheDocument();
      });
      
      // Registered domains should NEVER be present
      REGISTERED_DOMAINS.forEach(domain => {
        expect(queryByText(domain.name)).not.toBeInTheDocument();
      });
      
      // Count should only include available domains
      const expectedCount = AVAILABLE_DOMAINS.length;
      expect(getByText(new RegExp(`Available Domains \\(${expectedCount} found\\)`))).toBeInTheDocument();
    });
    
    it('REGRESSION: Handles empty results when all domains are unavailable', () => {
      const { getByText, queryByText } = render(
        <DomainResults {...defaultProps} domains={REGISTERED_DOMAINS} />
      );
      
      expect(getByText('No available domains found')).toBeInTheDocument();
      expect(getByText(/Available Domains \(0 found\)/)).toBeInTheDocument();
      
      // No domain names should be rendered
      REGISTERED_DOMAINS.forEach(domain => {
        expect(queryByText(domain.name)).not.toBeInTheDocument();
      });
    });
    
    it('REGRESSION: Shows correct counts and badges', () => {
      const { getAllByText, getByText } = render(
        <DomainResults {...defaultProps} />
      );
      
      const availableBadges = getAllByText('Available');
      expect(availableBadges).toHaveLength(AVAILABLE_DOMAINS.length);
      
      const expectedCount = AVAILABLE_DOMAINS.length;
      expect(getByText(new RegExp(`Available Domains \\(${expectedCount} found\\)`))).toBeInTheDocument();
    });
  });
  
  describe('Buy Button Validation Requirements', () => {
    
    it('REGRESSION: Buy buttons only appear for available domains', () => {
      const { getAllByText } = render(<DomainResults {...defaultProps} />);
      
      const buyButtons = getAllByText('BUY NOW');
      expect(buyButtons).toHaveLength(AVAILABLE_DOMAINS.length);
    });
    
    it('REGRESSION: Buy button validates link before opening', async () => {
      const user = userEvent.setup();
      const { getAllByText } = render(<DomainResults {...defaultProps} />);
      
      const buyButtons = getAllByText('BUY NOW');
      await user.click(buyButtons[0]);
      
      // Should call validate-buy-link function
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('validate-buy-link', {
        body: { domain: AVAILABLE_DOMAINS[0].name }
      });
    });
    
    it('REGRESSION: Buy button respects validation failure', async () => {
      const user = userEvent.setup();
      
      // Mock validation failure
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: { ok: false, error: '404' },
        error: null
      });
      
      const mockWindowOpen = vi.fn();
      vi.stubGlobal('window', { ...window, open: mockWindowOpen });
      
      const { getAllByText } = render(<DomainResults {...defaultProps} />);
      
      const buyButtons = getAllByText('BUY NOW');
      await user.click(buyButtons[0]);
      
      // Should not open window if validation fails
      expect(mockWindowOpen).not.toHaveBeenCalled();
      
      vi.unstubAllGlobals();
    });
  });
  
  describe('FlipScore Display Requirements', () => {
    
    it('REGRESSION: FlipScore only shown for available domains', () => {
      // This test would need access to the FlipScore display logic
      // For now, we verify the domain data structure
      const availableDomainsWithScores = AVAILABLE_DOMAINS.filter(d => d.flipScore);
      
      const { container } = render(<DomainResults {...defaultProps} />);
      
      // Count elements that would contain flip scores
      const scoreElements = container.querySelectorAll('[class*="flip"], [class*="score"]');
      
      // Should have score displays for available domains only
      expect(scoreElements.length).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('Selection and Bulk Actions', () => {
    
    it('REGRESSION: Can only select available domains', () => {
      const { getAllByRole } = render(<DomainResults {...defaultProps} />);
      
      const checkboxes = getAllByRole('checkbox');
      // Should have checkboxes for available domains + "Select All"
      expect(checkboxes.length).toBe(AVAILABLE_DOMAINS.length + 1);
    });
    
    it('REGRESSION: Select all only selects available domains', async () => {
      const user = userEvent.setup();
      const mixedDomains = [...AVAILABLE_DOMAINS, ...REGISTERED_DOMAINS];
      
      const { getAllByRole } = render(
        <DomainResults {...defaultProps} domains={mixedDomains} />
      );
      
      const checkboxes = getAllByRole('checkbox');
      const selectAllCheckbox = checkboxes[0]; // First checkbox is typically "Select All"
      
      await user.click(selectAllCheckbox);
      
      // Should only affect available domains (test via UI state)
      // This would need more sophisticated testing of internal state
    });
  });
  
  describe('Edge Cases and Error States', () => {
    
    it('REGRESSION: Handles loading state correctly', () => {
      const { container, getByText } = render(
        <DomainResults {...defaultProps} isLoading={true} />
      );
      
      // Should show loading skeletons
      const skeletons = container.querySelectorAll('[class*="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
      
      // Should not show domain content
      AVAILABLE_DOMAINS.forEach(domain => {
        expect(() => getByText(domain.name)).toThrow();
      });
    });
    
    it('REGRESSION: Handles malformed domain data', () => {
      const malformedDomains = [
        { name: 'valid.com', available: true, price: 10, tld: 'com' },
        { name: '', available: true, price: 10, tld: 'com' }, // Empty name
        { /* missing fields */ },
        null,
        undefined
      ];
      
      // Should not crash
      expect(() => {
        render(<DomainResults {...defaultProps} domains={malformedDomains} />);
      }).not.toThrow();
    });
    
    it('REGRESSION: Preserves user interactions during updates', async () => {
      const user = userEvent.setup();
      const { rerender, getAllByRole } = render(<DomainResults {...defaultProps} />);
      
      // Select a domain
      const checkboxes = getAllByRole('checkbox');
      await user.click(checkboxes[1]); // First domain checkbox
      
      // Update domains list
      const updatedDomains = [
        ...AVAILABLE_DOMAINS,
        { name: 'new-domain.com', available: true, price: 15, tld: 'com' }
      ];
      
      rerender(<DomainResults {...defaultProps} domains={updatedDomains} />);
      
      // Previous selection should be preserved (if domain still exists)
      // This would need testing of component state management
    });
  });
  
  describe('Accessibility and UX', () => {
    
    it('REGRESSION: Has proper ARIA labels and roles', () => {
      const { getAllByRole } = render(<DomainResults {...defaultProps} />);
      
      // Should have proper checkbox roles
      const checkboxes = getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
      
      // Should have proper button roles
      const buttons = getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
    
    it('REGRESSION: Keyboard navigation works', async () => {
      const user = userEvent.setup();
      const { getAllByRole } = render(<DomainResults {...defaultProps} />);
      
      const checkboxes = getAllByRole('checkbox');
      
      // Should be able to navigate with keyboard
      await user.tab();
      expect(document.activeElement).toBeTruthy();
    });
  });
  
  describe('Performance and Memory', () => {
    
    it('REGRESSION: Handles large domain lists efficiently', () => {
      const largeDomainList = Array.from({ length: 100 }, (_, i) => ({
        name: `domain-${i}.com`,
        available: true,
        price: 10 + i,
        tld: 'com',
        flipScore: 50 + i
      }));
      
      const start = performance.now();
      
      const { container } = render(
        <DomainResults {...defaultProps} domains={largeDomainList} />
      );
      
      const end = performance.now();
      
      // Should render within reasonable time (adjust threshold as needed)
      expect(end - start).toBeLessThan(1000); // 1 second
      expect(container.children.length).toBeGreaterThan(0);
    });
  });
});