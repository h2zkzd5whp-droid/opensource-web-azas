import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Landing from '../pages/Landing';

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, logout: vi.fn(), updateUser: vi.fn() }),
}));

vi.mock('../assets/landing_image.png', () => ({ default: 'landing_image.png' }));
vi.mock('../assets/landing_slide_1.png', () => ({ default: 'landing_slide_1.png' }));
vi.mock('../assets/landing_slide_2.png', () => ({ default: 'landing_slide_2.png' }));
vi.mock('../assets/landing_slide_3.png', () => ({ default: 'landing_slide_3.png' }));

function renderLanding() {
  return render(<Landing />);
}

describe('Landing — nav', () => {
  test('renders brand logo linking home', () => {
    renderLanding();
    expect(screen.getByRole('link', { name: /ajas editor/i })).toHaveAttribute('href', '/');
  });

  test('Sign in link points to /login', () => {
    renderLanding();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });

  test('Get started link points to /register', () => {
    renderLanding();
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/register');
  });
});

describe('Landing — step 0 (CTA)', () => {
  test('shows CTA heading on initial render', () => {
    renderLanding();
    expect(screen.getByText(/open the editor/i)).toBeInTheDocument();
  });

  test('Open editor link points to /code', () => {
    renderLanding();
    expect(screen.getByRole('link', { name: /open editor/i })).toHaveAttribute('href', '/code');
  });

  test('Create account link points to /register', () => {
    renderLanding();
    const links = screen.getAllByRole('link', { name: /create account/i });
    expect(links[0]).toHaveAttribute('href', '/register');
  });
});

describe('Landing — step 1 (features)', () => {
  test('renders all three feature tags', () => {
    renderLanding();
    expect(screen.getByText(/01 · edit/i)).toBeInTheDocument();
    expect(screen.getByText(/02 · run/i)).toBeInTheDocument();
    expect(screen.getByText(/03 · save/i)).toBeInTheDocument();
  });
});

describe('Landing — step 2 (hero)', () => {
  test('renders hero tagline', () => {
    renderLanding();
    expect(screen.getByText(/write, run, save/i)).toBeInTheDocument();
  });
});

describe('Landing — step 3 (placeholder)', () => {
  test('renders placeholder content', () => {
    renderLanding();
    expect(screen.getByText(/placeholder title/i)).toBeInTheDocument();
  });
});
