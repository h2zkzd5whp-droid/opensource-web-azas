import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Login from '../pages/Login';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

function renderLogin() {
  return render(<Login />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Login — server error messages', () => {
  async function submitAndExpect(errorCode, expectedMessage) {
    mockLogin.mockRejectedValueOnce(Object.assign(new Error(), { errorCode }));
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@a.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass1234');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    });
  }

  test('WRONG_PASSWORD', () => submitAndExpect('WRONG_PASSWORD', 'Incorrect email or password.'));
  test('FIELD_MISSING', () => submitAndExpect('FIELD_MISSING', 'Please enter your email and password.'));
});

describe('Login — success', () => {
  test('success → navigate to /dashboard', async () => {
    mockLogin.mockResolvedValueOnce();
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@a.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass1234');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});

describe('Login — UI', () => {
  test('Sign up link points to /register', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/register');
  });
});
