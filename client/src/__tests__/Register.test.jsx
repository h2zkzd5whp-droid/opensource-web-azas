import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Register from '../pages/Register';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, logout: vi.fn(), updateUser: vi.fn() }),
}));

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from '../utils/api';

function renderRegister() {
  return render(<Register />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Register — client validation', () => {
  test('passwords do not match → show error', async () => {
    renderRegister();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@a.com');
    await userEvent.type(screen.getByPlaceholderText('your nickname'), 'nick');

    const [pw, confirm] = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(pw, 'pass1234');
    await userEvent.type(confirm, 'different');

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
  });

  test('passwords do not match → apiRequest not called', async () => {
    renderRegister();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@a.com');
    await userEvent.type(screen.getByPlaceholderText('your nickname'), 'nick');

    const [pw, confirm] = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(pw, 'pass1234');
    await userEvent.type(confirm, 'different');

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('Register — server error messages', () => {
  async function submitAndExpect(errorCode, expectedMessage) {
    apiRequest.mockRejectedValueOnce(Object.assign(new Error(), { errorCode }));
    renderRegister();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@a.com');
    await userEvent.type(screen.getByPlaceholderText('your nickname'), 'nick');

    const [pw, confirm] = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(pw, 'pass1234');
    await userEvent.type(confirm, 'pass1234');

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    });
  }

  test('FIELD_MISSING', () => submitAndExpect('FIELD_MISSING', 'Please fill in all fields.'));
  test('INVALID_EMAIL', () => submitAndExpect('INVALID_EMAIL', 'Please enter a valid email address.'));
  test('PASSWORD_TOO_SHORT', () => submitAndExpect('PASSWORD_TOO_SHORT', 'Password must be at least 8 characters.'));
  test('NICKNAME_EMPTY', () => submitAndExpect('NICKNAME_EMPTY', 'Please enter a nickname.'));
  test('EMAIL_DUPLICATE', () => submitAndExpect('EMAIL_DUPLICATE', 'This email is already in use.'));
});

describe('Register — success', () => {
  test('success → navigate to /login', async () => {
    apiRequest.mockResolvedValueOnce({});
    renderRegister();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@a.com');
    await userEvent.type(screen.getByPlaceholderText('your nickname'), 'nick');

    const [pw, confirm] = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(pw, 'pass1234');
    await userEvent.type(confirm, 'pass1234');

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});

describe('Register — UI', () => {
  test('Sign in link points to /login', () => {
    renderRegister();
    // Both the footer link and the navbar "Sign in" point to /login
    const signInLinks = screen.getAllByRole('link', { name: /sign in/i });
    expect(signInLinks.length).toBeGreaterThan(0);
    signInLinks.forEach((link) => expect(link).toHaveAttribute('href', '/login'));
  });
});
