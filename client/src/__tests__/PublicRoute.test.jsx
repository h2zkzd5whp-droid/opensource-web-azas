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

test('loading 중 → "loading" 표시', () => {
  useAuth.mockReturnValue({ user: null, loading: true });
  render(<PublicRoute><div>content</div></PublicRoute>);
  expect(screen.getByText('loading')).toBeInTheDocument();
});

test('user 있음 → /dashboard로 redirect', () => {
  useAuth.mockReturnValue({ user: { userId: 1 }, loading: false });
  render(<PublicRoute><div>content</div></PublicRoute>);
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
});

test('user 없음 → children 렌더링', () => {
  useAuth.mockReturnValue({ user: null, loading: false });
  render(<PublicRoute><div>content</div></PublicRoute>);
  expect(screen.getByText('content')).toBeInTheDocument();
});
