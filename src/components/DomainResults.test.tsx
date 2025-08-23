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

const mockAvailableDomains = [
  { name: 'example1.com', available: true, price: 10, tld: 'com', flipScore: 85 },
  { name: 'example2.net', available: true, price: 15, tld: 'net' }
];

const mockUnavailableDomains = [
  { name: 'unavailable.org', available: false, price: 20, tld: 'org' },
  { name: 'getsupermind.com', available: false, price: 12.99, tld: 'com' }
];

const defaultProps = {
  domains: mockAvailableDomains,
  onAddToCart: vi.fn(),
  onBack: vi.fn(),
  isLoading: false,
  query: 'test'
};

describe('DomainResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders only available domains', () => {
    const { getByText } = render(<DomainResults {...defaultProps} />);
    
    expect(getByText('example1.com')).toBeInTheDocument();
    expect(getByText('example2.net')).toBeInTheDocument();
    
    // Should show available count
    expect(getByText(/Available Domains \(2 found\)/)).toBeInTheDocument();
  });

  it('does not render unavailable domains', () => {
    const propsWithUnavailable = {
      ...defaultProps,
      domains: [...mockAvailableDomains, ...mockUnavailableDomains]
    };
    
    const { getByText, queryByText } = render(<DomainResults {...propsWithUnavailable} />);
    
    // Available domains should be present
    expect(getByText('example1.com')).toBeInTheDocument();
    expect(getByText('example2.net')).toBeInTheDocument();
    
    // Unavailable domains should NOT be present
    expect(queryByText('unavailable.org')).not.toBeInTheDocument();
    expect(queryByText('getsupermind.com')).not.toBeInTheDocument();
    
    // Count should only include available domains
    expect(getByText(/Available Domains \(2 found\)/)).toBeInTheDocument();
  });

  it('shows correct availability badges for available domains', () => {
    const { getAllByText } = render(<DomainResults {...defaultProps} />);
    
    const availableBadges = getAllByText('Available');
    expect(availableBadges).toHaveLength(2);
  });

  it('renders checkboxes for available domains', () => {
    const { getAllByRole } = render(<DomainResults {...defaultProps} />);
    
    const checkboxes = getAllByRole('checkbox');
    // Should have 3 checkboxes: 2 for domains + 1 for "Select All"
    expect(checkboxes).toHaveLength(3);
  });

  it('shows "No available domains found" when no available domains', () => {
    const propsNoAvailable = {
      ...defaultProps,
      domains: mockUnavailableDomains
    };
    
    const { getByText } = render(<DomainResults {...propsNoAvailable} />);
    
    expect(getByText('No available domains found')).toBeInTheDocument();
    expect(getByText(/Available Domains \(0 found\)/)).toBeInTheDocument();
  });

  it('validates buy links before opening', async () => {
    const user = userEvent.setup();
    const { getAllByText } = render(<DomainResults {...defaultProps} />);
    
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
    
    const { getAllByText } = render(<DomainResults {...defaultProps} />);
    
    const buyButtons = getAllByText('BUY NOW');
    await user.click(buyButtons[0]);
    
    // Should not open window if validation fails
    expect(mockWindowOpen).not.toHaveBeenCalled();
    
    vi.unstubAllGlobals();
  });

  it('never renders getsupermind.com as available', () => {
    const propsWithGetsupermind = {
      ...defaultProps,
      domains: [
        ...mockAvailableDomains, 
        { name: 'getsupermind.com', available: false, price: 12.99, tld: 'com' }
      ]
    };
    
    const { getByText, queryByText } = render(<DomainResults {...propsWithGetsupermind} />);
    
    // getsupermind.com should never appear
    expect(queryByText('getsupermind.com')).not.toBeInTheDocument();
    
    // Only available domains should be shown
    expect(getByText('example1.com')).toBeInTheDocument();
    expect(getByText('example2.net')).toBeInTheDocument();
    
    // Should show correct count excluding unavailable domains
    expect(getByText(/Available Domains \(2 found\)/)).toBeInTheDocument();
  });
});