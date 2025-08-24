import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { AuthForm } from './AuthForm';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Supabase
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      resetPasswordForEmail: vi.fn(),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
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
    // Stub console.assert to prevent test noise
    vi.stubGlobal('console', { ...console, assert: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderAuthForm = (props = {}) => {
    return render(
      <BrowserRouter>
        <AuthForm {...props} />
      </BrowserRouter>
    );
  };

  describe('Login Success Redirect', () => {
    it('should navigate to /app on successful login', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({ error: null });

      const { getByLabelText, getByRole } = renderAuthForm();

      const user = userEvent.setup();

      // Fill in login form
      await user.type(getByLabelText(/email/i), 'test@example.com');
      await user.type(getByLabelText(/password/i), 'password123');
      await user.click(getByRole('button', { name: /sign in/i }));

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });

    it('should call onAuthSuccess callback instead of navigating when provided', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({ error: null });
      const mockOnAuthSuccess = vi.fn();

      const { getByLabelText, getByRole } = renderAuthForm({ onAuthSuccess: mockOnAuthSuccess });

      const user = userEvent.setup();

      // Fill in login form
      await user.type(getByLabelText(/email/i), 'test@example.com');
      await user.type(getByLabelText(/password/i), 'password123');
      await user.click(getByRole('button', { name: /sign in/i }));

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockOnAuthSuccess).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Signup Success Redirect', () => {
    it('should navigate to /app on successful signup', async () => {
      mockSignUp.mockResolvedValueOnce({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      });

      const { getByLabelText, getByRole, getAllByLabelText } = renderAuthForm();

      const user = userEvent.setup();

      // Switch to signup tab
      await user.click(getByRole('tab', { name: /sign up/i }));

      // Fill in signup form
      await user.type(getByLabelText(/email/i), 'test@example.com');
      await user.type(getAllByLabelText(/password/i)[0], 'password123');
      await user.type(getByLabelText(/confirm password/i), 'password123');
      await user.click(getByRole('button', { name: /create account/i }));

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });

    it('should call onAuthSuccess callback instead of navigating when provided', async () => {
      mockSignUp.mockResolvedValueOnce({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      });
      const mockOnAuthSuccess = vi.fn();

      const { getByLabelText, getByRole, getAllByLabelText } = renderAuthForm({ onAuthSuccess: mockOnAuthSuccess });

      const user = userEvent.setup();

      // Switch to signup tab
      await user.click(getByRole('tab', { name: /sign up/i }));

      // Fill in signup form
      await user.type(getByLabelText(/email/i), 'test@example.com');
      await user.type(getAllByLabelText(/password/i)[0], 'password123');
      await user.type(getByLabelText(/confirm password/i), 'password123');
      await user.click(getByRole('button', { name: /create account/i }));

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockOnAuthSuccess).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should not redirect on login error', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({ 
        error: { message: 'Invalid login credentials' } 
      });

      const { getByLabelText, getByRole, getByText } = renderAuthForm();

      const user = userEvent.setup();

      // Fill in login form
      await user.type(getByLabelText(/email/i), 'test@example.com');
      await user.type(getByLabelText(/password/i), 'wrongpassword');
      await user.click(getByRole('button', { name: /sign in/i }));

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(getByText(/invalid email or password/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not redirect on signup error', async () => {
      mockSignUp.mockResolvedValueOnce({ 
        error: { message: 'User already registered' } 
      });

      const { getByLabelText, getByRole, getAllByLabelText, getByText } = renderAuthForm();

      const user = userEvent.setup();

      // Switch to signup tab
      await user.click(getByRole('tab', { name: /sign up/i }));

      // Fill in signup form
      await user.type(getByLabelText(/email/i), 'existing@example.com');
      await user.type(getAllByLabelText(/password/i)[0], 'password123');
      await user.type(getByLabelText(/confirm password/i), 'password123');
      await user.click(getByRole('button', { name: /create account/i }));

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(getByText(/an account with this email already exists/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});