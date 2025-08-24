
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AppHeader } from './AppHeader';

// Mock Supabase
const mockSupabase = {
  auth: {
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    })),
    getSession: vi.fn(),
    signOut: vi.fn()
  },
  functions: {
    invoke: vi.fn()
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn()
      }))
    }))
  })),
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn()
    }))
  })),
  removeChannel: vi.fn()
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AppHeader Authentication State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display user email when authenticated', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com'
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null
    });

    renderWithRouter(<AppHeader user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('should show sign in button when not authenticated', () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });

    renderWithRouter(<AppHeader user={null} />);

    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should display credit balance component when authenticated', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com'
    };

    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({
            data: { current_credits: 50, total_purchased_credits: 0 },
            error: null
          })
        })
      })
    });

    renderWithRouter(<AppHeader user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText(/credit balance/i)).toBeInTheDocument();
    });
  });

  it('should show buy credits button when authenticated', () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com'
    };

    renderWithRouter(<AppHeader user={mockUser} />);

    expect(screen.getByRole('button', { name: /buy credits/i })).toBeInTheDocument();
  });

  it('should show logout button when authenticated', () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com'
    };

    renderWithRouter(<AppHeader user={mockUser} />);

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });
});
