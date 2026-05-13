import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PublicRoute from '../components/PublicRoute';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }) => { mockNavigate(to); return null; },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../contexts/AuthContext';

beforeEach(() => vi.clearAllMocks());

test('loading → show "loading"', () => {
  useAuth.mockReturnValue({ user: null, loading: true });
  render(<PublicRoute><div>content</div></PublicRoute>);
  expect(screen.getByText('loading')).toBeInTheDocument();
});

test('user exists → redirect to /dashboard', () => {
  useAuth.mockReturnValue({ user: { userId: 1 }, loading: false });
  render(<PublicRoute><div>content</div></PublicRoute>);
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
});

test('no user → render children', () => {
  useAuth.mockReturnValue({ user: null, loading: false });
  render(<PublicRoute><div>content</div></PublicRoute>);
  expect(screen.getByText('content')).toBeInTheDocument();
});
