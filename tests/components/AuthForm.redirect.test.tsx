import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthForm } from '@/components/AuthForm';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Supabase
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignIn,
      signUp: mockSignUp,
    },
    rpc: vi.fn(),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('AuthForm Redirect Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.assert for dev checks
    vi.stubGlobal('console', { assert: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderAuthForm = () => {
    return render(
      <BrowserRouter>
        <AuthForm />
      </BrowserRouter>
    );
  };

  describe('Login Success Redirect', () => {
    it('redirects to /app after successful login', async () => {
      mockSignIn.mockResolvedValue({ error: null });

      renderAuthForm();

      // Fill login form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });

      // Submit login form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app');
      });
    });

    it('calls onAuthSuccess callback when provided instead of redirect', async () => {
      const mockOnAuthSuccess = vi.fn();
      mockSignIn.mockResolvedValue({ error: null });

      render(
        <BrowserRouter>
          <AuthForm onAuthSuccess={mockOnAuthSuccess} />
        </BrowserRouter>
      );

      // Fill login form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });

      // Submit login form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockOnAuthSuccess).toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Signup Success Redirect', () => {
    it('redirects to /app after successful signup', async () => {
      mockSignUp.mockResolvedValue({ 
        error: null,
        data: { user: { id: 'user-123' } }
      });

      renderAuthForm();

      // Switch to signup tab
      fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));

      // Fill signup form
      fireEvent.change(screen.getByDisplayValue(''), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getAllByDisplayValue('')[0], {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getAllByDisplayValue('')[1], {
        target: { value: 'password123' }
      });

      // Submit signup form
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app');
      });
    });

    it('calls onAuthSuccess callback when provided instead of redirect', async () => {
      const mockOnAuthSuccess = vi.fn();
      mockSignUp.mockResolvedValue({ 
        error: null,
        data: { user: { id: 'user-123' } }
      });

      render(
        <BrowserRouter>
          <AuthForm onAuthSuccess={mockOnAuthSuccess} />
        </BrowserRouter>
      );

      // Switch to signup tab
      fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));

      // Fill signup form (use more specific selectors)
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'password123' } });

      // Submit signup form
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockOnAuthSuccess).toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('does not redirect on login error', async () => {
      mockSignIn.mockResolvedValue({ 
        error: { message: 'Invalid login credentials' }
      });

      renderAuthForm();

      // Fill and submit login form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' }
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not redirect on signup error', async () => {
      mockSignUp.mockResolvedValue({ 
        error: { message: 'User already registered' }
      });

      renderAuthForm();

      // Switch to signup tab and fill form
      fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Role-based email UX', () => {
    it('shows inline warning for role-based emails on signup', async () => {
      render(
        <BrowserRouter>
          <AuthForm />
        </BrowserRouter>
      );
      
      // Switch to signup tab
      fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));
      
      // Type a role-based email
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'support@fig-io.com' }
      });
      
      expect(screen.getByText(/shared or team email/i)).toBeInTheDocument();
    });

    it('maps Supabase invalid email to role-based message when applicable', async () => {
      mockSignUp.mockResolvedValue({ 
        error: { message: 'email_address_invalid' } 
      });

      render(
        <BrowserRouter>
          <AuthForm />
        </BrowserRouter>
      );
      
      // Switch to signup tab
      fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));

      // Fill with role-based email
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      fireEvent.change(emailInput, { target: { value: 'support@fig-io.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'password123' } });

      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/role-based emails.*aren't supported/i)).toBeInTheDocument();
      });
    });

    it('shows helper text on signup tab', async () => {
      render(
        <BrowserRouter>
          <AuthForm />
        </BrowserRouter>
      );
      
      // Switch to signup tab
      fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));
      
      expect(screen.getByText(/we currently only support personal email/i)).toBeInTheDocument();
    });
  });
});