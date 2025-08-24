import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DomainResults from './DomainResults';
import * as spaceshipUtils from '@/utils/spaceship';

// Mock the spaceship utilities
vi.mock('@/utils/spaceship', () => ({
  buildSpaceshipUrl: vi.fn((domain: string) => `https://mock-spaceship-url.com?domain=${domain}`),
  openInBatches: vi.fn()
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

const mockAvailableDomains = [
  { domain: 'example1.com', available: true, price: 10, flipScore: 85 },
  { domain: 'example2.net', available: true, price: 15 }
];

const mockUnavailableDomains = [
  { domain: 'unavailable.org', available: false, price: 20 },
  { domain: 'getsupermind.com', available: false, price: 12.99 }
];

// Mock Zustand stores
const mockSetResults = vi.fn();
const mockSetLoading = vi.fn();
const mockAdd = vi.fn();
const mockRemove = vi.fn();
const mockClear = vi.fn();
const mockSet = vi.fn();

const mockUseSearchStore = vi.fn(() => ({
  results: mockAvailableDomains,
  loading: false,
  setResults: mockSetResults,
  setLoading: mockSetLoading,
}));

vi.mock('@/lib/store', () => ({
  useSearchStore: mockUseSearchStore,
  useSelectedDomains: vi.fn(() => ({
    selectedDomains: [],
    add: mockAdd,
    remove: mockRemove,
    clear: mockClear,
    set: mockSet,
  })),
}));

// Mock fetcher function
const mockFetcher = vi.fn().mockResolvedValue({
  results: mockAvailableDomains,
  suggestions: []
});

describe('DomainResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchStore.mockReturnValue({
      results: mockAvailableDomains,
      loading: false,
      setResults: mockSetResults,
      setLoading: mockSetLoading,
    });
  });

  it('renders available domains from store', async () => {
    const { getByText } = render(<DomainResults />);
    
    expect(getByText('example1.com')).toBeInTheDocument();
    expect(getByText('example2.net')).toBeInTheDocument();
  });

  it('renders both available and unavailable domains', async () => {
    mockUseSearchStore.mockReturnValue({
      results: [...mockAvailableDomains, ...mockUnavailableDomains],
      loading: false,
      setResults: mockSetResults,
      setLoading: mockSetLoading,
    });
    
    const { getByText } = render(<DomainResults />);
    
    // All domains should be present
    expect(getByText('example1.com')).toBeInTheDocument();
    expect(getByText('example2.net')).toBeInTheDocument();
    expect(getByText('unavailable.org')).toBeInTheDocument();
    expect(getByText('getsupermind.com')).toBeInTheDocument();
  });

  it('shows no results message when store has empty results', async () => {
    mockUseSearchStore.mockReturnValue({
      results: [],
      loading: false,
      setResults: mockSetResults,
      setLoading: mockSetLoading,
    });
    
    const { getByText } = render(<DomainResults />);
    
    expect(getByText(/No results found/)).toBeInTheDocument();
  });

  it('displays flip score when available', async () => {
    const { getByText } = render(<DomainResults />);
    
    expect(getByText('Flip Score: 85')).toBeInTheDocument();
  });

  it('shows trust badge when results are present', async () => {
    const { getByText } = render(<DomainResults />);
    
    expect(getByText('Trust Layer')).toBeInTheDocument();
    expect(getByText('Tested. Logged. Safe to Buy.')).toBeInTheDocument();
  });

  it('does not show trust badge when loading', () => {
    mockUseSearchStore.mockReturnValue({
      results: [],
      loading: true,
      setResults: mockSetResults,
      setLoading: mockSetLoading,
    });
    
    const { queryByText } = render(<DomainResults />);
    
    expect(queryByText('Trust Layer')).not.toBeInTheDocument();
  });

  describe('Affiliate link regression tests', () => {
    beforeEach(async () => {
      // Use real buildSpaceshipUrl implementation for these tests
      const actualSpaceship = await vi.importActual<typeof spaceshipUtils>('@/utils/spaceship');
      vi.mocked(spaceshipUtils.buildSpaceshipUrl).mockImplementation(
        actualSpaceship.buildSpaceshipUrl
      );
    });

    afterEach(() => {
      // Reset to mock implementation
      vi.mocked(spaceshipUtils.buildSpaceshipUrl).mockImplementation(
        (domain: string) => `https://mock-spaceship-url.com?domain=${domain}`
      );
    });

    it('should generate direct spaceship URL when no CJ base is set', () => {
      // Temporarily clear VITE_CJ_DEEPLINK_BASE
      const originalEnv = import.meta.env.VITE_CJ_DEEPLINK_BASE;
      // @ts-ignore - Override for test
      import.meta.env.VITE_CJ_DEEPLINK_BASE = undefined;
      
      const { container } = render(<DomainResults />);
      const buyLink = container.querySelector('a[href*="spaceship.com"]') as HTMLAnchorElement;
      
      expect(buyLink).toBeInTheDocument();
      expect(buyLink.href).toContain('https://www.spaceship.com/domains?search=');
      expect(buyLink.href).not.toContain('/domain-registration/results');
      expect(buyLink.href).toContain('irgwc=1');
      expect(buyLink.target).toBe('_blank');
      expect(buyLink.rel).toBe('noopener noreferrer');
      
      // Restore original env
      // @ts-ignore
      import.meta.env.VITE_CJ_DEEPLINK_BASE = originalEnv;
    });

    it('should generate CJ deeplink when CJ base is set', () => {
      // Set CJ base for test
      const originalEnv = import.meta.env.VITE_CJ_DEEPLINK_BASE;
      // @ts-ignore - Override for test
      import.meta.env.VITE_CJ_DEEPLINK_BASE = 'https://spaceship.sjv.io/c/123/456/789?';
      
      const { container } = render(<DomainResults />);
      const buyLink = container.querySelector('a') as HTMLAnchorElement;
      
      expect(buyLink).toBeInTheDocument();
      expect(buyLink.href).toContain('spaceship.sjv.io');
      expect(buyLink.href).toContain('u=');
      
      // Extract and verify u parameter
      const url = new URL(buyLink.href);
      const uParam = url.searchParams.get('u');
      expect(uParam).toBeTruthy();
      
      const decodedInner = decodeURIComponent(uParam!);
      expect(decodedInner).toContain('https://www.spaceship.com/domains?search=');
      expect(decodedInner).not.toContain('/domain-registration/results');
      expect(decodedInner).toContain('irgwc=1');
      
      expect(buyLink.target).toBe('_blank');
      expect(buyLink.rel).toBe('noopener noreferrer');
      
      // Restore original env
      // @ts-ignore
      import.meta.env.VITE_CJ_DEEPLINK_BASE = originalEnv;
    });

    it('should never contain deprecated domain-registration/results path', () => {
      const testCases = [
        undefined, // No CJ base
        'https://spaceship.sjv.io/c/123/456/789?', // With CJ base
        'https://spaceship.sjv.io/c/123/456/789?u=' // CJ base ending with u=
      ];
      
      testCases.forEach(cjBase => {
        const originalEnv = import.meta.env.VITE_CJ_DEEPLINK_BASE;
        // @ts-ignore - Override for test
        import.meta.env.VITE_CJ_DEEPLINK_BASE = cjBase;
        
        const { container } = render(<DomainResults />);
        const buyLinks = container.querySelectorAll('a');
        
        buyLinks.forEach(link => {
          expect(link.href).not.toContain('/domain-registration/results');
          expect(link.href).not.toContain('irclickid');
          if (link.href.includes('spaceship.com')) {
            expect(link.href).toContain('irgwc=1');
          }
        });
        
        // Restore original env
        // @ts-ignore
        import.meta.env.VITE_CJ_DEEPLINK_BASE = originalEnv;
      });
    });
  });
});
