import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Register from '../pages/Register';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from '../utils/api';

function renderRegister() {
  return render(<Register />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Register — client validation', () => {
  test('비밀번호 불일치 시 에러 메시지 표시', async () => {
    renderRegister();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@a.com');
    await userEvent.type(screen.getByPlaceholderText('your nickname'), 'nick');

    const [pw, confirm] = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(pw, 'pass1234');
    await userEvent.type(confirm, 'different');

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
  });

  test('비밀번호 불일치 시 apiRequest 호출 안 됨', async () => {
    renderRegister();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@a.com');
    await userEvent.type(screen.getByPlaceholderText('your nickname'), 'nick');

    const [pw, confirm] = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(pw, 'pass1234');
    await userEvent.type(confirm, 'different');

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('Register — server error messages', () => {
  async function submitAndExpect(errorCode, expectedMessage) {
    apiRequest.mockRejectedValueOnce(Object.assign(new Error(), { errorCode }));
    renderRegister();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@a.com');
    await userEvent.type(screen.getByPlaceholderText('your nickname'), 'nick');

    const [pw, confirm] = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(pw, 'pass1234');
    await userEvent.type(confirm, 'pass1234');

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    });
  }

  test('FIELD_MISSING', () => submitAndExpect('FIELD_MISSING', '모든 항목을 입력해주세요.'));
  test('INVALID_EMAIL', () => submitAndExpect('INVALID_EMAIL', '유효한 이메일 주소를 입력해주세요.'));
  test('PASSWORD_TOO_SHORT', () => submitAndExpect('PASSWORD_TOO_SHORT', '비밀번호는 8자 이상이어야 합니다.'));
  test('NICKNAME_EMPTY', () => submitAndExpect('NICKNAME_EMPTY', '닉네임을 입력해주세요.'));
  test('EMAIL_DUPLICATE', () => submitAndExpect('EMAIL_DUPLICATE', '이미 사용 중인 이메일입니다.'));
});

describe('Register — success', () => {
  test('성공 시 /login으로 이동', async () => {
    apiRequest.mockResolvedValueOnce({});
    renderRegister();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@a.com');
    await userEvent.type(screen.getByPlaceholderText('your nickname'), 'nick');

    const [pw, confirm] = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(pw, 'pass1234');
    await userEvent.type(confirm, 'pass1234');

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});

describe('Register — UI', () => {
  test('Sign in 링크가 /login으로 연결', () => {
    renderRegister();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });
});
