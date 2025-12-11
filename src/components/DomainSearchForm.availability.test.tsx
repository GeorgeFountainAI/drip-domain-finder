import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DomainSearchForm } from './DomainSearchForm';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock the API calls
const mockSearchDomains = vi.fn();
const mockSupabase = {
  functions: {
    invoke: vi.fn()
  }
};

// Mock modules
vi.mock('@/api/domainSearchClient', () => ({
  default: mockSearchDomains
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('@/hooks/useConsumeCreditRPC', () => ({
  useConsumeCreditRPC: () => ({ 
    consumeCredits: vi.fn().mockResolvedValue(10),
    loading: false
  })
}));

vi.mock('@/hooks/useGetCreditBalance', () => ({
  useGetCreditBalance: () => ({ 
    credits: 20,
    loading: false,
    error: null,
    refetch: vi.fn()
  })
}));

vi.mock('@/hooks/useAdminBypass', () => ({
  useAdminBypass: () => ({ isAdmin: false })
}));

// Remove RequireCredits mock since it's no longer used

vi.mock('@/components/SearchHistory', () => ({
  SearchHistory: () => <div>Search History</div>
}));

const renderComponent = () => {
  return render(
    <TooltipProvider>
      <DomainSearchForm />
    </TooltipProvider>
  );
};

describe('DomainSearchForm - Availability Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock search domains to return both ai.com and getai.com
    mockSearchDomains.mockResolvedValue({
      domains: [
        {
          name: 'ai.com',
          available: true,
          price: 12.99,
          tld: 'com',
          flipScore: 95,
          trendStrength: 5
        },
        {
          name: 'getai.com',
          available: true,
          price: 12.99,
          tld: 'com',
          flipScore: 80,
          trendStrength: 4
        }
      ],
      error: null,
      isDemo: false
    });

    // Mock validate-buy-link function
    mockSupabase.functions.invoke.mockImplementation(({ body }: { body: { domain: string } }) => {
      if (body.domain === 'ai.com') {
        return Promise.resolve({ data: { ok: false } });
      }
      if (body.domain === 'getai.com') {
        return Promise.resolve({ data: { ok: true } });
      }
      return Promise.resolve({ data: { ok: false } });
    });
  });

  it('should not render blocked domains like ai.com', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = document.querySelector('input[placeholder*="search by keyword"]') as HTMLInputElement;
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

    if (input && submitButton) {
      await user.type(input, 'ai');
      await user.click(submitButton);
    }

    // Give a moment for async validation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check that ai.com is not rendered because it's blocked
    expect(document.body.textContent).not.toContain('ai.com');
  });

  it('should render available domains with correct Buy button', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = document.querySelector('input[placeholder*="search by keyword"]') as HTMLInputElement;
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

    if (input && submitButton) {
      await user.type(input, 'ai');
      await user.click(submitButton);
    }

    // Give a moment for async validation
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that getai.com is rendered and validated
    expect(document.body.textContent).toContain('getai.com');

    // Check for Buy button with correct attributes
    const buyButton = document.querySelector('[data-testid="buy-button"]');
    expect(buyButton).toBeTruthy();
    expect(buyButton).toHaveAttribute('href', '/api/go/namecheap?d=getai.com');
    expect(buyButton).toHaveAttribute('target', '_blank');
    expect(buyButton).toHaveAttribute('rel', 'noopener noreferrer');
    expect(buyButton?.textContent).toContain('Buy on Namecheap');
  });

  it('should validate domains in batches using edge function', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = document.querySelector('input[placeholder*="search by keyword"]') as HTMLInputElement;
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

    if (input && submitButton) {
      await user.type(input, 'ai');
      await user.click(submitButton);
    }

    // Give a moment for async validation
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should call validate-buy-link for getai.com (ai.com is blocked)
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('validate-buy-link', {
      body: { domain: 'getai.com' }
    });

    // Should not call validate-buy-link for ai.com since it's blocked
    expect(mockSupabase.functions.invoke).not.toHaveBeenCalledWith('validate-buy-link', {
      body: { domain: 'ai.com' }
    });
  });
});