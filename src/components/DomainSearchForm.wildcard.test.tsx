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

vi.mock('@/hooks/useConsumeCredit', () => ({
  useConsumeCredit: () => ({ 
    consumeCredit: vi.fn().mockResolvedValue({ success: true }),
    loading: false
  })
}));

vi.mock('@/hooks/useAdminBypass', () => ({
  useAdminBypass: () => ({ isAdmin: false })
}));

vi.mock('@/components/RequireCredits', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

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

describe('DomainSearchForm - Wildcard Search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return and display wildcard search results for supermind*', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = document.querySelector('input[placeholder*="search by keyword"]') as HTMLInputElement;
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

    // Perform wildcard search
    await user.type(input, 'supermind*');
    await user.click(submitButton);

    // Give time for search to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // Should see multiple domain results
    expect(document.body.textContent).toContain('.com');
    const domainElements = document.querySelectorAll('[data-testid*="domain-"]');
    expect(domainElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should render Buy buttons with correct attributes for wildcard results', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = document.querySelector('input[placeholder*="search by keyword"]') as HTMLInputElement;
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

    await user.type(input, 'supermind*');
    await user.click(submitButton);

    // Give time for search to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // Find Buy buttons
    const buyButtons = document.querySelectorAll('a[href*="/api/go/spaceship"]');
    expect(buyButtons.length).toBeGreaterThan(0);

    // Check first Buy button attributes
    const firstBuyButton = buyButtons[0] as HTMLAnchorElement;
    expect(firstBuyButton.target).toBe('_blank');
    expect(firstBuyButton.rel).toBe('noopener noreferrer');
    expect(firstBuyButton.href).toMatch(/\/api\/go\/spaceship\?d=.*\.com/);
  });

  it('should display FlipScore pills for wildcard results', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = document.querySelector('input[placeholder*="search by keyword"]') as HTMLInputElement;
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

    await user.type(input, 'supermind*');
    await user.click(submitButton);

    // Give time for search to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // Should see FlipScore indicators
    expect(document.body.textContent).toContain('/100');
  });

  it('should show success toast for wildcard search completion', async () => {
    const mockToast = vi.fn();
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });

    const user = userEvent.setup();
    renderComponent();

    const input = document.querySelector('input[placeholder*="search by keyword"]') as HTMLInputElement;
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

    if (input && submitButton) {
      await user.type(input, 'test*');
      await user.click(submitButton);
    }

    // Give time for search to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Wildcard Search Complete",
        description: expect.stringContaining("Found"),
        variant: "default"
      })
    );
  });

  it('should bypass validation for wildcard searches when flag is disabled', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = document.querySelector('input[placeholder*="search by keyword"]') as HTMLInputElement;
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

    if (input && submitButton) {
      await user.type(input, 'ai*'); // This would normally be blocked
      await user.click(submitButton);
    }

    // Give time for search to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // Should see results even for patterns that would normally be blocked
    expect(document.body.textContent).toContain('.com');

    // Validation function should not have been called for wildcard
    expect(mockSupabase.functions.invoke).not.toHaveBeenCalledWith('validate-buy-link', expect.any(Object));
  });
});