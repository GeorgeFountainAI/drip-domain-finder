
import { render } from '@testing-library/react';
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

  it('should display user email when authenticated', () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z'
    } as any;

    renderWithRouter(<AppHeader user={mockUser} />);

    expect(document.body.textContent).toContain('test@example.com');
  });

  it('should show sign in button when not authenticated', () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });

    renderWithRouter(<AppHeader user={null} />);

    expect(document.body.textContent).toContain('Sign In');
  });

  it('should display credit balance component when authenticated', () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z'
    } as any;

    renderWithRouter(<AppHeader user={mockUser} />);

    expect(document.body.textContent).toContain('Credits');
  });

  it('should show buy credits button when authenticated', () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z'
    } as any;

    renderWithRouter(<AppHeader user={mockUser} />);

    expect(document.body.textContent).toContain('Buy Credits');
  });

  it('should show logout button when authenticated', () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z'
    } as any;

    renderWithRouter(<AppHeader user={mockUser} />);

    expect(document.body.textContent).toContain('Logout');
  });
});
