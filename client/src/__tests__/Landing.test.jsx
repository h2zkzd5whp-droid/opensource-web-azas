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

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn().mockResolvedValue({
    members: [
      { memberId: 1, name: 'Test Member', role: 'Backend Developer', githubUrl: 'https://github.com/test', email: 'test@test.com', imgKey: 'test.png' }
    ]
  }),
}));

vi.mock('../assets/landingPage.gif', () => ({ default: 'landingPage.gif' }));

function renderLanding() {
  render(<Landing />);
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
    expect(screen.getByRole('heading', { name: /AZAS Editor/i })).toBeInTheDocument();
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
  test('renders AI feature tag', () => {
    renderLanding();
    expect(screen.getByText(/01 · Style Reviewer AI/i)).toBeInTheDocument();
  });
});

describe('Landing — step 2 (hero)', () => {
  test('renders compiler features heading', () => {
    renderLanding();
    expect(screen.getByText((content) => /Project Goals & Architecture/i.test(content))).toBeInTheDocument();
  });
});

describe('Landing — step 3 (contributors)', () => {
  test('renders contributors content', () => {
    renderLanding();
    expect(screen.getByText((content) => /Contributors/i.test(content))).toBeInTheDocument();
  });
});

describe('Landing — step 4 (team members)', () => {
  test('renders dynamic team members from API', async () => {
    renderLanding();
    const memberName = await screen.findByText('Test Member');
    expect(memberName).toBeInTheDocument();
    expect(screen.getByText(/Backend Developer/i)).toBeInTheDocument();
  });
});