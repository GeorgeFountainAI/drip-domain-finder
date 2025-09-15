import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DomainResults from './DomainResults';
import { buildSpaceshipUrl } from '@/utils/spaceship';

// Mock the spaceship utility
const mockBuildSpaceshipUrl = vi.fn();
const mockOpenInBatches = vi.fn();
vi.mock('@/utils/spaceship', () => ({
  buildSpaceshipUrl: mockBuildSpaceshipUrl,
  openInBatches: mockOpenInBatches,
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
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
  }
}));

// Mock domain data
const mockDomainResults = [
  { domain: 'example1.com', available: true, price: 12.99, flipScore: 85 },
  { domain: 'example2.com', available: false, price: 15.99, flipScore: 70 } // unavailable should not be rendered
];

// Mock Zustand stores
const mockAddDomain = vi.fn();
const mockRemoveDomain = vi.fn();
const mockClearSelection = vi.fn();
const mockSelectAll = vi.fn();

vi.mock('@/lib/store', () => ({
  useSearchStore: vi.fn(),
  useSelectedDomains: vi.fn(),
}));

const { useSearchStore, useSelectedDomains } = vi.mocked(
  await import('@/lib/store')
);

describe('DomainResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default spaceship URL mock
    mockBuildSpaceshipUrl.mockImplementation((domain: string) => 
      `https://www.spaceship.com/domains?search=${encodeURIComponent(domain)}&irgwc=1`
    );
    
    // Setup default store state
    (useSearchStore as any).mockReturnValue({
      results: [],
      loading: false,
      setResults: vi.fn(),
    });
    
    (useSelectedDomains as any).mockReturnValue({
      selectedDomains: new Set(),
      addDomain: mockAddDomain,
      removeDomain: mockRemoveDomain,
      clearSelection: mockClearSelection,
      selectAll: mockSelectAll,
    });
  });

  describe('loading state', () => {
    it('should display loading message when loading', () => {
      (useSearchStore as any).mockReturnValue({
        results: [],
        loading: true,
        setResults: vi.fn(),
      });

      const { getByText } = render(<DomainResults />);
      
      expect(getByText('Loading results...')).toBeInTheDocument();
    });
  });

  describe('renders available domains', () => {
    it('should display domain cards with correct information in responsive grid', () => {
      (useSearchStore as any).mockReturnValue({
        results: mockDomainResults,
        loading: false,
        setResults: vi.fn(),
      });

      const { getByTestId, getByText, getAllByTestId } = render(<DomainResults />);
      
      // Check grid container has grid classes directly
      const container = getByTestId('domain-results');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3');
      
      // Check domain cards are present
      const domainCards = getAllByTestId('domain-card');
      expect(domainCards.length).toBeGreaterThan(0);
      
      // Check domain card content
      expect(getByText('example1.com')).toBeInTheDocument();
      expect(getByText('$12.99')).toBeInTheDocument();
      expect(getByText(/Flip Score: 85/)).toBeInTheDocument();
    });

    it('should have correct data-testid attributes for testing', () => {
      (useSearchStore as any).mockReturnValue({
        results: mockDomainResults,
        loading: false,
        setResults: vi.fn(),
      });

      const { getByTestId } = render(<DomainResults />);
      
      expect(getByTestId('domain-results')).toBeInTheDocument();
      expect(getByTestId('domain-card')).toBeInTheDocument();
      expect(getByTestId('domain-name')).toBeInTheDocument();
      expect(getByTestId('domain-price')).toBeInTheDocument();
      expect(getByTestId('flip-score')).toBeInTheDocument();
      expect(getByTestId('buy-button')).toBeInTheDocument();
    });
  });

  describe('displays flip score only for available domains', () => {
    it('should show flip score for available domains', () => {
      (useSearchStore as any).mockReturnValue({
        results: mockDomainResults,
        loading: false,
        setResults: vi.fn(),
      });

      const { getByText, getByTestId } = render(<DomainResults />);
      
      expect(getByText(/Flip Score: 85/)).toBeInTheDocument();
      expect(getByTestId('flip-score')).toBeInTheDocument();
    });

    it('should not show flip score for unavailable domains', () => {
      const mixedResults = [
        ...mockDomainResults,
        { domain: 'unavailable.com', available: false, price: null, flipScore: 75 }
      ];

      (useSearchStore as any).mockReturnValue({
        results: mixedResults,
        loading: false,
        setResults: vi.fn(),
      });

      const { queryByText, getAllByTestId } = render(<DomainResults />);
      
      // Should not show flip score for unavailable domain
      expect(queryByText(/Flip Score: 75/)).not.toBeInTheDocument();
      // Should only have one flip score element (for available domain)
      expect(getAllByTestId('flip-score')).toHaveLength(1);
    });
  });

  describe('shows trust layer badge when results exist', () => {
    it('should display trust layer badge when there are results', () => {
      (useSearchStore as any).mockReturnValue({
        results: mockDomainResults,
        loading: false,
        setResults: vi.fn(),
      });

      const { getByTestId, getByText } = render(<DomainResults />);
      
      const trustBadge = getByTestId('trust-layer');
      expect(trustBadge).toBeInTheDocument();
      expect(getByText(/Trust Layer Certified/)).toBeInTheDocument();
    });

    it('should not display trust layer badge when loading', () => {
      (useSearchStore as any).mockReturnValue({
        results: [],
        loading: true,
        setResults: vi.fn(),
      });

      const { queryByTestId, queryByText } = render(<DomainResults />);
      
      expect(queryByTestId('trust-layer')).not.toBeInTheDocument();
      expect(queryByText(/Trust Layer Certified/)).not.toBeInTheDocument();
    });
  });

  describe('affiliate link generation', () => {
    beforeEach(() => {
      // Reset to default mock before each test
      mockBuildSpaceshipUrl.mockImplementation((domain: string) => 
        `https://www.spaceship.com/domains?search=${encodeURIComponent(domain)}&irgwc=1`
      );
    });

    afterEach(() => {
      // No environment cleanup needed with hardcoded values
    });

    it('should generate hardcoded affiliate URLs', () => {
      (useSearchStore as any).mockReturnValue({
        results: [{ domain: 'test.com', available: true, price: 10 }],
        loading: false,
        setResults: vi.fn(),
      });

      const { getByTestId } = render(<DomainResults />);
      
      const buyLink = getByTestId('buy-button');
      expect(mockBuildSpaceshipUrl).toHaveBeenCalledWith('test.com');
    });

    it('should generate affiliate URLs consistently', () => {
      // Mock the buildSpaceshipUrl to return hardcoded affiliate link
      mockBuildSpaceshipUrl.mockImplementation((domain: string) => 
        `https://spaceship.sjv.io/APQy0D`
      );

      (useSearchStore as any).mockReturnValue({
        results: [{ domain: 'test.com', available: true, price: 10 }],
        loading: false,
        setResults: vi.fn(),
      });

      const { getByTestId } = render(<DomainResults />);
      
      const buyLink = getByTestId('buy-button');
      expect(buyLink).toHaveAttribute('href', 'https://spaceship.sjv.io/APQy0D');
    });

    it('should never include deprecated paths', () => {
      (useSearchStore as any).mockReturnValue({
        results: [{ domain: 'test.com', available: true, price: 10 }],
        loading: false,
        setResults: vi.fn(),
      });

      const { getByTestId } = render(<DomainResults />);
      
      const buyLink = getByTestId('buy-button');
      const href = buyLink.getAttribute('href')!;
      
      expect(href).not.toContain('/domain-registration/results');
      expect(href).not.toContain('irclickid');
    });

    it('should have target="_blank" and rel="noopener noreferrer" on all buy buttons', () => {
      (useSearchStore as any).mockReturnValue({
        results: [
          { domain: 'test1.com', available: true, price: 10 },
          { domain: 'test2.com', available: true, price: 15 }
        ],
        loading: false,
        setResults: vi.fn(),
      });

      const { getAllByTestId } = render(<DomainResults />);
      
      const buyLinks = getAllByTestId('buy-button');
      buyLinks.forEach(buyLink => {
        expect(buyLink).toHaveAttribute('target', '_blank');
        expect(buyLink).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });
});