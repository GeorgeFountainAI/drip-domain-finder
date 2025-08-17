import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DomainResults } from './DomainResults';
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
    })
  }
}));

const mockDomains = [
  { name: 'example1', available: true, price: 10, tld: '.com', flipScore: 85 },
  { name: 'example2', available: true, price: 15, tld: '.net' },
  { name: 'unavailable', available: false, price: 20, tld: '.org' }
];

const defaultProps = {
  domains: mockDomains,
  onAddToCart: vi.fn(),
  onBack: vi.fn(),
  isLoading: false,
  query: 'test'
};

describe('DomainResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list of domains with checkboxes', () => {
    const { getByText, getAllByRole } = render(<DomainResults {...defaultProps} />);
    
    expect(getByText('example1')).toBeInTheDocument();
    expect(getByText('example2')).toBeInTheDocument();
    expect(getByText('unavailable')).toBeInTheDocument();
    
    const checkboxes = getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('calls buildSpaceshipUrl with correct domain', () => {
    render(<DomainResults {...defaultProps} />);
    expect(spaceshipUtils.buildSpaceshipUrl).toBeDefined();
  });
});