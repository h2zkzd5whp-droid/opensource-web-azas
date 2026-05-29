import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import NotFound from '../pages/NotFound';

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

function renderNotFound() {
  return render(<NotFound />);
}

describe('NotFound', () => {
  test('renders 404 code number', () => {
    renderNotFound();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  test('renders PAGE NOT FOUND label', () => {
    renderNotFound();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  test('renders heading', () => {
    renderNotFound();
    expect(
      screen.getByRole('heading', { name: /this route doesn't exist/i }),
    ).toBeInTheDocument();
  });

  test('Go home link points to /', () => {
    renderNotFound();
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });

  test('Dashboard link points to /dashboard', () => {
    renderNotFound();
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });
});
