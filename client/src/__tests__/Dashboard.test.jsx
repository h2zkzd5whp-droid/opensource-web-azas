import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Dashboard from '../pages/Dashboard';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

let mockUserData = { email: 'a@a.com', nickname: 'Val', theme: 'dark', fontSize: 14 };
const mockLogout = vi.fn();
const mockUpdateUser = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUserData, logout: mockLogout, updateUser: mockUpdateUser }),
}));

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

vi.mock('../components/ThemeApplier', () => ({
  default: () => null,
}));

import { apiRequest } from '../utils/api';

const sampleCodes = [
  { codeId: 1, title: 'fizzbuzz.py', language: 'python', updatedAt: '2024-01-10T00:00:00Z' },
  { codeId: 2, title: 'two-sum.js', language: 'javascript', updatedAt: '2024-01-05T00:00:00Z' },
];

function renderDashboard() {
  return render(<Dashboard />);
}

afterEach(() => cleanup());

beforeEach(() => {
  vi.resetAllMocks();
  mockUserData = { email: 'a@a.com', nickname: 'Val', theme: 'dark', fontSize: 14 };
  apiRequest.mockResolvedValue({ codes: sampleCodes, total: 2 });
  mockNavigate.mockImplementation(() => {});
  mockLogout.mockImplementation(() => {});
  mockUpdateUser.mockImplementation(() => {});
});

// ─── Step 1: 기본 렌더링 & 프로젝트 목록 ────────────────────────────────────

describe('Dashboard — Step 1: 기본 렌더링', () => {
  test('마운트 시 GET /code를 호출한다', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/code');
    });
  });

  test('프로젝트 카드가 로드된 목록만큼 렌더된다', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('fizzbuzz.py')).toBeInTheDocument();
      expect(screen.getByText('two-sum.js')).toBeInTheDocument();
    });
  });

  test('프로젝트가 없을 때 empty state가 렌더된다', async () => {
    apiRequest.mockResolvedValueOnce({ codes: [], total: 0 });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
    });
  });

  test('빈 상태에서 New Project 버튼이 렌더된다', async () => {
    apiRequest.mockResolvedValueOnce({ codes: [], total: 0 });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument();
    });
  });

  test('New Project 버튼 클릭 시 /code로 이동한다', async () => {
    apiRequest.mockResolvedValueOnce({ codes: [], total: 0 });
    renderDashboard();
    await waitFor(() => screen.getByRole('button', { name: /new project/i }));
    await userEvent.click(screen.getByRole('button', { name: /new project/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/code');
  });
});

// ─── Step 2: 카드 클릭 & 삭제 ───────────────────────────────────────────────

describe('Dashboard — Step 2: 카드 클릭 & 삭제', () => {
  test('프로젝트 카드 클릭 시 /code/:codeId로 이동한다', async () => {
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    await userEvent.click(screen.getByText('fizzbuzz.py'));
    expect(mockNavigate).toHaveBeenCalledWith('/code/1');
  });

  test('삭제 버튼 클릭 시 ConfirmModal이 열린다', async () => {
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    const deleteButtons = screen.getAllByRole('button', { name: /delete fizzbuzz/i });
    await userEvent.click(deleteButtons[0]);
    expect(screen.getByText(/this cannot be undone/i)).toBeInTheDocument();
  });

  test('ConfirmModal에서 Cancel 클릭 시 DELETE API를 호출하지 않는다', async () => {
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    const deleteButtons = screen.getAllByRole('button', { name: /delete fizzbuzz/i });
    await userEvent.click(deleteButtons[0]);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(apiRequest).not.toHaveBeenCalledWith('/code/1', expect.objectContaining({ method: 'DELETE' }));
  });

  test('ConfirmModal에서 Confirm 클릭 시 DELETE /code/:codeId를 호출한다', async () => {
    apiRequest
      .mockResolvedValueOnce({ codes: sampleCodes, total: 2 }) // GET /code
      .mockResolvedValueOnce(null)                              // DELETE
      .mockResolvedValueOnce({ codes: [sampleCodes[1]], total: 1 }); // GET /code refresh
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    const deleteButtons = screen.getAllByRole('button', { name: /delete fizzbuzz/i });
    await userEvent.click(deleteButtons[0]);
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/code/1', { method: 'DELETE' });
    });
  });

  test('삭제 성공 후 목록이 갱신된다', async () => {
    apiRequest
      .mockResolvedValueOnce({ codes: sampleCodes, total: 2 })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ codes: [sampleCodes[1]], total: 1 });
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    const deleteButtons = screen.getAllByRole('button', { name: /delete fizzbuzz/i });
    await userEvent.click(deleteButtons[0]);
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => {
      expect(screen.queryByText('fizzbuzz.py')).not.toBeInTheDocument();
      expect(screen.getByText('two-sum.js')).toBeInTheDocument();
    });
  });
});
