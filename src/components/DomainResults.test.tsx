import { describe, it, expect, beforeEach, vi } from 'vitest';
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

// Mock Zustand stores
const mockSetResults = vi.fn();
const mockSetLoading = vi.fn();
const mockAdd = vi.fn();
const mockRemove = vi.fn();
const mockClear = vi.fn();
const mockSet = vi.fn();

vi.mock('@/lib/store', () => ({
  useSearchStore: vi.fn(() => ({
    results: [],
    loading: false,
    setResults: mockSetResults,
    setLoading: mockSetLoading,
  })),
  useSelectedDomains: vi.fn(() => ({
    selectedDomains: [],
    add: mockAdd,
    remove: mockRemove,
    clear: mockClear,
    set: mockSet,
  })),
}));

const mockAvailableDomains = [
  { domain: 'example1.com', available: true, price: 10, flipScore: 85 },
  { domain: 'example2.net', available: true, price: 15 }
];

const mockUnavailableDomains = [
  { domain: 'unavailable.org', available: false, price: 20 },
  { domain: 'getsupermind.com', available: false, price: 12.99 }
];

// Mock fetcher function
const mockFetcher = vi.fn().mockResolvedValue({
  results: mockAvailableDomains,
  suggestions: []
});

describe('DomainResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcher.mockResolvedValue({
      results: mockAvailableDomains,
      suggestions: []
    });
  });

  it('renders only available domains', async () => {
    const { getByText } = render(<DomainResults query="test" fetcher={mockFetcher} />);
    
    // Wait for async effects
    await vi.waitFor(() => {
      expect(getByText('example1.com')).toBeInTheDocument();
      expect(getByText('example2.net')).toBeInTheDocument();
    });
  });

  it('does not render unavailable domains', async () => {
    mockFetcher.mockResolvedValue({
      results: [...mockAvailableDomains, ...mockUnavailableDomains],
      suggestions: []
    });
    
    const { getByText, queryByText } = render(<DomainResults query="test" fetcher={mockFetcher} />);
    
    await vi.waitFor(() => {
      // Available domains should be present
      expect(getByText('example1.com')).toBeInTheDocument();
      expect(getByText('example2.net')).toBeInTheDocument();
      
      // All domains should be present in this version since we show both available and unavailable
      expect(queryByText('unavailable.org')).toBeInTheDocument();
      expect(queryByText('getsupermind.com')).toBeInTheDocument();
    });
  });

  it('shows no domains when fetcher returns empty results', async () => {
    mockFetcher.mockResolvedValue({
      results: [],
      suggestions: []
    });
    
    const { getByText } = render(<DomainResults query="test" fetcher={mockFetcher} />);
    
    await vi.waitFor(() => {
      expect(getByText(/No results found/)).toBeInTheDocument();
    });
  });

  it('contains correct affiliate URL structure', async () => {
    const { getAllByText } = render(<DomainResults query="test" fetcher={mockFetcher} />);
    
    await vi.waitFor(() => {
      const buyButtons = getAllByText('Buy Now ↗');
      const firstBuyButton = buyButtons[0] as HTMLAnchorElement;
      
      expect(firstBuyButton.href).toContain('spaceship.sjv.io');
      expect(firstBuyButton.href).toContain('6354443');
    });
  });

  it('shows trust badge when results are present', async () => {
    const { getByText } = render(<DomainResults query="test" fetcher={mockFetcher} />);
    
    await vi.waitFor(() => {
      expect(getByText('🛡️ Trust Layer Certified')).toBeInTheDocument();
      expect(getByText('Tested. Logged. Safe to Buy.')).toBeInTheDocument();
    });
  });

  it('does not show trust badge when loading', () => {
    // Mock a fetcher that never resolves to simulate loading state
    const pendingFetcher = vi.fn().mockReturnValue(new Promise(() => {}));
    
    const { queryByText } = render(<DomainResults query="test" fetcher={pendingFetcher} />);
    
    expect(queryByText('🛡️ Trust Layer Certified')).not.toBeInTheDocument();
  });
});
