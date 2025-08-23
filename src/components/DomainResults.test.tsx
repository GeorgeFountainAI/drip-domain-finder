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

describe('DomainResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset store mocks to default state
    const { useSearchStore } = require('@/lib/store');
    vi.mocked(useSearchStore).mockReturnValue({
      results: mockAvailableDomains,
      loading: false,
      setResults: mockSetResults,
      setLoading: mockSetLoading,
    });
    
    const { useSelectedDomains } = require('@/lib/store');
    vi.mocked(useSelectedDomains).mockReturnValue({
      selectedDomains: [],
      add: mockAdd,
      remove: mockRemove,
      clear: mockClear,
      set: mockSet,
    });
  });

  it('renders only available domains', () => {
    const { getByText } = render(<DomainResults results={mockAvailableDomains} />);
    
    expect(getByText('example1.com')).toBeInTheDocument();
    expect(getByText('example2.net')).toBeInTheDocument();
  });

  it('does not render unavailable domains', () => {
    const { useSearchStore } = require('@/lib/store');
    vi.mocked(useSearchStore).mockReturnValue({
      results: [...mockAvailableDomains, ...mockUnavailableDomains],
      loading: false,
      setResults: mockSetResults,
      setLoading: mockSetLoading,
    });
    
    const { getByText, queryByText } = render(<DomainResults results={[...mockAvailableDomains, ...mockUnavailableDomains]} />);
    
    // Available domains should be present
    expect(getByText('example1.com')).toBeInTheDocument();
    expect(getByText('example2.net')).toBeInTheDocument();
    
    // Unavailable domains should NOT be present
    expect(queryByText('unavailable.org')).not.toBeInTheDocument();
    expect(queryByText('getsupermind.com')).not.toBeInTheDocument();
  });

  it('shows correct availability badges for available domains', () => {
    const { getAllByText } = render(<DomainResults results={mockAvailableDomains} />);
    
    const availableBadges = getAllByText('✅ Available');
    expect(availableBadges).toHaveLength(2);
  });

  it('renders checkboxes for available domains', () => {
    const { getAllByRole } = render(<DomainResults results={mockAvailableDomains} />);
    
    const checkboxes = getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2); // 2 for domains
  });

  it('shows no domains when store is empty', () => {
    const { useSearchStore } = require('@/lib/store');
    vi.mocked(useSearchStore).mockReturnValue({
      results: [],
      loading: false,
      setResults: mockSetResults,
      setLoading: mockSetLoading,
    });
    
    const { container } = render(<DomainResults results={[]} />);
    
    // Should render empty container
    expect(container.firstChild?.children).toHaveLength(0);
  });

  it('contains correct affiliate URL with irclickid', () => {
    const { getAllByText } = render(<DomainResults results={mockAvailableDomains} />);
    
    const buyButtons = getAllByText('BUY NOW');
    const firstBuyButton = buyButtons[0] as HTMLAnchorElement;
    
    expect(firstBuyButton.href).toBe(
      'https://www.spaceship.com/domains/domain-registration/results?search=example1.com&irclickid=Wc7xihyLMxycUY8QQ-Spo2Tf4Ukp26X0lyT-3Uk0'
    );
  });

  it('validates buy links before opening', async () => {
    const user = userEvent.setup();
    const { getAllByText } = render(<DomainResults results={mockAvailableDomains} />);
    
    const buyButtons = getAllByText('BUY NOW');
    await user.click(buyButtons[0]);
    
    // Should call validate-buy-link function
    const { supabase } = await import('@/integrations/supabase/client');
    expect(supabase.functions.invoke).toHaveBeenCalledWith('validate-buy-link', {
      body: { domain: 'example1.com' }
    });
  });

  it('prevents opening invalid buy links', async () => {
    const user = userEvent.setup();
    
    // Mock validation failure
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { ok: false, error: '404' },
      error: null
    });
    
    // Mock window.open to track calls
    const mockWindowOpen = vi.fn();
    vi.stubGlobal('window', { ...window, open: mockWindowOpen });
    
    const { getAllByText } = render(<DomainResults results={mockAvailableDomains} />);
    
    const buyButtons = getAllByText('BUY NOW');
    await user.click(buyButtons[0]);
    
    // Should not open window if validation fails
    expect(mockWindowOpen).not.toHaveBeenCalled();
    
    vi.unstubAllGlobals();
  });

  it('never renders getsupermind.com as available', () => {
    const { useSearchStore } = require('@/lib/store');
    vi.mocked(useSearchStore).mockReturnValue({
      results: [
        ...mockAvailableDomains, 
        { domain: 'getsupermind.com', available: false, price: 12.99 }
      ],
      loading: false,
      setResults: mockSetResults,
      setLoading: mockSetLoading,
    });
    
    const { getByText, queryByText } = render(<DomainResults results={[...mockAvailableDomains, { domain: 'getsupermind.com', available: false, price: 12.99 }]} />);
    
    // getsupermind.com should never appear
    expect(queryByText('getsupermind.com')).not.toBeInTheDocument();
    
    // Only available domains should be shown
    expect(getByText('example1.com')).toBeInTheDocument();
    expect(getByText('example2.net')).toBeInTheDocument();
  });
});