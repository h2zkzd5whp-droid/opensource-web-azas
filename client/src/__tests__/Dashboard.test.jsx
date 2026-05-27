import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, afterEach } from 'vitest';

afterEach(() => cleanup());
import Dashboard from '../pages/Dashboard';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
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

import { apiRequest } from '../utils/api';

const sampleCodes = [
  { codeId: 1, title: 'fizzbuzz.py', language: 'python', updatedAt: '2024-01-10T00:00:00Z' },
  { codeId: 2, title: 'two-sum.js', language: 'javascript', updatedAt: '2024-01-05T00:00:00Z' },
];

function renderDashboard() {
  return render(<Dashboard />);
}

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

  test('New Project 버튼이 렌더된다', () => {
    renderDashboard();
    expect(screen.getAllByRole('button', { name: /new project/i }).length).toBeGreaterThan(0);
  });

  test('New Project 버튼 클릭 시 /code로 이동한다', async () => {
    renderDashboard();
    await userEvent.click(screen.getAllByRole('button', { name: /new project/i })[0]);
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
    // ConfirmModal의 confirmLabel이 "Delete"인 버튼: autoFocus 속성 확인
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

// ─── Step 3: 설정 — 테마 & 폰트 사이즈 ─────────────────────────────────────

describe('Dashboard — Step 3: 설정 — 테마 & 폰트 사이즈', () => {
  test('테마 토글 클릭 시 PUT /auth/me를 theme: light로 호출한다', async () => {
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    await userEvent.click(screen.getByRole('button', { name: /theme/i }));
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        '/auth/me',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"theme":"light"'),
        })
      );
    });
  });

  test('폰트 사이즈 + 버튼 클릭 시 PUT /auth/me를 fontSize+1로 호출한다', async () => {
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    await userEvent.click(screen.getByRole('button', { name: /increase font/i }));
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        '/auth/me',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"fontSize":15'),
        })
      );
    });
  });

  test('폰트 사이즈 − 버튼 클릭 시 PUT /auth/me를 fontSize-1로 호출한다', async () => {
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    await userEvent.click(screen.getByRole('button', { name: /decrease font/i }));
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        '/auth/me',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"fontSize":13'),
        })
      );
    });
  });

  test('폰트 사이즈가 24일 때 + 버튼이 비활성화된다', async () => {
    mockUserData = { ...mockUserData, fontSize: 24 };
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    expect(screen.getByRole('button', { name: /increase font/i })).toBeDisabled();
  });
});

// ─── Step 4: 설정 — 비밀번호 변경 ───────────────────────────────────────────

describe('Dashboard — Step 4: 비밀번호 변경', () => {
  test('Change 버튼 클릭 시 비밀번호 변경 폼이 열린다', async () => {
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    await userEvent.click(screen.getByRole('button', { name: /change/i }));
    expect(screen.getByPlaceholderText(/current password/i)).toBeInTheDocument();
  });

  test('비밀번호 변경 폼 제출 시 PUT /auth/password를 호출한다', async () => {
    apiRequest
      .mockResolvedValueOnce({ codes: sampleCodes, total: 2 })
      .mockResolvedValueOnce({ message: 'ok' });
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    await userEvent.click(screen.getByRole('button', { name: /change/i }));
    await userEvent.type(screen.getByPlaceholderText(/current password/i), 'oldpass1');
    await userEvent.type(screen.getByPlaceholderText(/new password/i), 'newpass1');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        '/auth/password',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ oldPassword: 'oldpass1', newPassword: 'newpass1' }),
        })
      );
    });
  });

  test('비밀번호 변경 성공 시 폼이 닫힌다', async () => {
    apiRequest
      .mockResolvedValueOnce({ codes: sampleCodes, total: 2 })
      .mockResolvedValueOnce({ message: 'ok' });
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    await userEvent.click(screen.getByRole('button', { name: /change/i }));
    await userEvent.type(screen.getByPlaceholderText(/current password/i), 'oldpass1');
    await userEvent.type(screen.getByPlaceholderText(/new password/i), 'newpass1');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/current password/i)).not.toBeInTheDocument();
    });
  });

  test('WRONG_PASSWORD 오류 시 에러 메시지가 표시된다', async () => {
    apiRequest
      .mockResolvedValueOnce({ codes: sampleCodes, total: 2 })
      .mockRejectedValueOnce(Object.assign(new Error(), { errorCode: 'WRONG_PASSWORD' }));
    renderDashboard();
    await waitFor(() => screen.getByText('fizzbuzz.py'));
    await userEvent.click(screen.getByRole('button', { name: /change/i }));
    await userEvent.type(screen.getByPlaceholderText(/current password/i), 'wrong');
    await userEvent.type(screen.getByPlaceholderText(/new password/i), 'newpass1');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() => {
      expect(screen.getByText(/incorrect.*password/i)).toBeInTheDocument();
    });
  });
});

// ─── Step 5: 로그아웃 ────────────────────────────────────────────────────────

describe('Dashboard — Step 5: 로그아웃', () => {
  test('Logout 버튼 클릭 시 logout()을 호출하고 /login으로 이동한다', async () => {
    renderDashboard();
    await userEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
