import { render, screen, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from '../utils/api';

function TestConsumer() {
  const { user, loading } = useAuth();
  if (loading) return <div>loading</div>;
  return <div>{user ? `user:${user.email}` : 'no user'}</div>;
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

test('no token → user null, loading false', async () => {
  renderWithProvider();
  await waitFor(() => expect(screen.getByText('no user')).toBeInTheDocument());
});

test('valid token → calls /auth/me and sets user', async () => {
  localStorage.setItem('token', 'valid-token');
  apiRequest.mockResolvedValueOnce({ email: 'a@a.com' });

  renderWithProvider();

  await waitFor(() => expect(screen.getByText('user:a@a.com')).toBeInTheDocument());
  expect(apiRequest).toHaveBeenCalledWith('/auth/me');
});

test('/auth/me fails → removes token', async () => {
  localStorage.setItem('token', 'bad-token');
  apiRequest.mockRejectedValueOnce(new Error('Unauthorized'));

  renderWithProvider();

  await waitFor(() => expect(screen.getByText('no user')).toBeInTheDocument());
  expect(localStorage.getItem('token')).toBeNull();
});

test('login() → saves token and sets user', async () => {
  apiRequest
    .mockResolvedValueOnce({ token: 'new-token' })
    .mockResolvedValueOnce({ email: 'b@b.com' });

  function LoginButton() {
    const { login, user } = useAuth();
    return (
      <>
        <button onClick={() => login('b@b.com', 'pass1234')}>login</button>
        <div>{user ? `user:${user.email}` : 'no user'}</div>
      </>
    );
  }

  render(<AuthProvider><LoginButton /></AuthProvider>);
  await waitFor(() => screen.getByText('no user'));

  await act(async () => {
    screen.getByRole('button', { name: 'login' }).click();
  });

  await waitFor(() => expect(screen.getByText('user:b@b.com')).toBeInTheDocument());
  expect(localStorage.getItem('token')).toBe('new-token');
});

test('logout() → removes token and clears user', async () => {
  localStorage.setItem('token', 'valid-token');
  apiRequest.mockResolvedValueOnce({ email: 'a@a.com' });

  function LogoutButton() {
    const { logout, user } = useAuth();
    return (
      <>
        <button onClick={logout}>logout</button>
        <div>{user ? `user:${user.email}` : 'no user'}</div>
      </>
    );
  }

  render(<AuthProvider><LogoutButton /></AuthProvider>);
  await waitFor(() => screen.getByText('user:a@a.com'));

  await act(async () => {
    screen.getByRole('button', { name: 'logout' }).click();
  });

  await waitFor(() => expect(screen.getByText('no user')).toBeInTheDocument());
  expect(localStorage.getItem('token')).toBeNull();
});
