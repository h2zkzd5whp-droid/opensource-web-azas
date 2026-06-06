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

// Landing.test.jsx 상단의 apiRequest 모킹 영역 수정
vi.mock('../utils/api', () => ({
  apiRequest: vi.fn().mockResolvedValue({
    members: [
      { id: 1, name: 'Test Member', role: 'AI Developer', description: 'AI Dev' }
    ]
  }),
}));

vi.mock('../assets/landingPage.gif', () => ({ default: 'landingPage.gif' }));

// Helper 함수는 렌더링만 동기적으로 수행하도록 복원
function renderLanding() {
  render(<Landing />);
}

// 일반 정적 레이아웃 테스트는 동기식(기존 구조)으로 유지
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
    expect(screen.getByText(/AZAS Editor/i)).toBeInTheDocument();
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
    expect(screen.getByText(/Compiler Features/i)).toBeInTheDocument();
  });
});

describe('Landing — step 3 (contributors)', () => {
  test('renders contributors content', () => {
    renderLanding();
    expect(screen.getByText(/contributors/i)).toBeInTheDocument();
  });
});

// 비동기 팀원 렌더링 검증만 async/await와 findByText를 사용해 단독 격리
describe('Landing — step 4 (team members)', () => {
  test('renders dynamic team members from API with matched emojis', async () => {
    renderLanding();

    // 이 테스트 케이스 내에서만 비동기 요소가 나타날 때까지 대기 (act 경고 해결)
    const memberName = await screen.findByText('Test Member');
    expect(memberName).toBeInTheDocument();
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });
});