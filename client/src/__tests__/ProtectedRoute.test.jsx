import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ProtectedRoute from '../components/ProtectedRoute';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }) => { mockNavigate(to); return null; },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../contexts/AuthContext';

beforeEach(() => vi.clearAllMocks());

test('loading 중 → "loading..." 표시', () => {
  useAuth.mockReturnValue({ user: null, loading: true });
  render(<ProtectedRoute><div>content</div></ProtectedRoute>);
  expect(screen.getByText('loading...')).toBeInTheDocument();
});

test('user 없음 → /login으로 redirect', () => {
  useAuth.mockReturnValue({ user: null, loading: false });
  render(<ProtectedRoute><div>content</div></ProtectedRoute>);
  expect(mockNavigate).toHaveBeenCalledWith('/login');
});

test('user 있음 → children 렌더링', () => {
  useAuth.mockReturnValue({ user: { userId: 1 }, loading: false });
  render(<ProtectedRoute><div>content</div></ProtectedRoute>);
  expect(screen.getByText('content')).toBeInTheDocument();
});
