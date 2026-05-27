import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CodeEditor from '../pages/CodeEditor';

// Step 6: LoadCodeModal 흐름
// LoadCodeModal을 stub 없이 실제 컴포넌트로 렌더해 열기·선택·닫기 흐름을 검증

const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'a@a.com', theme: 'dark', fontSize: 14 } }),
}));

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

vi.mock('../hooks/useCodeExecution', () => ({
  default: () => ({ result: null, loading: false, error: null, run: vi.fn() }),
}));

vi.mock('../components/Editor', () => ({
  default: ({ onChange }) => (
    <textarea data-testid="editor" onChange={(e) => onChange(e.target.value)} />
  ),
}));

import { apiRequest } from '../utils/api';

beforeEach(() => {
  vi.clearAllMocks();
  mockUseParams.mockReturnValue({});
});

describe('CodeEditor — Step 6: LoadCodeModal 흐름', () => {
  test('Load 버튼 클릭 시 모달이 열린다', async () => {
    apiRequest.mockResolvedValueOnce({ codes: [] });
    render(<CodeEditor />);
    await userEvent.click(screen.getByRole('button', { name: /load/i }));
    expect(screen.getByText('Load code')).toBeInTheDocument();
  });

  test('모달 열리면 GET /code를 호출한다', async () => {
    apiRequest.mockResolvedValueOnce({ codes: [] });
    render(<CodeEditor />);
    await userEvent.click(screen.getByRole('button', { name: /load/i }));
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/code');
    });
  });

  test('코드 목록이 모달에 렌더된다', async () => {
    apiRequest.mockResolvedValueOnce({
      codes: [
        { codeId: 1, title: 'foo.js', language: 'javascript', updatedAt: '2024-01-01T00:00:00Z' },
        { codeId: 2, title: 'bar.py', language: 'python', updatedAt: '2024-01-02T00:00:00Z' },
      ],
    });
    render(<CodeEditor />);
    await userEvent.click(screen.getByRole('button', { name: /load/i }));
    await waitFor(() => {
      expect(screen.getByText('foo.js')).toBeInTheDocument();
      expect(screen.getByText('bar.py')).toBeInTheDocument();
    });
  });

  test('코드 선택 시 /code/:id로 navigate한다', async () => {
    apiRequest.mockResolvedValueOnce({
      codes: [
        { codeId: 3, title: 'hello.js', language: 'javascript', updatedAt: '2024-01-01T00:00:00Z' },
      ],
    });
    render(<CodeEditor />);
    await userEvent.click(screen.getByRole('button', { name: /load/i }));
    await waitFor(() => screen.getByText('hello.js'));
    await userEvent.click(screen.getByText('hello.js'));
    expect(mockNavigate).toHaveBeenCalledWith('/code/3');
  });

  test('닫기 버튼 클릭 시 모달이 닫힌다', async () => {
    apiRequest.mockResolvedValueOnce({ codes: [] });
    render(<CodeEditor />);
    await userEvent.click(screen.getByRole('button', { name: /load/i }));
    expect(screen.getByText('Load code')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByText('Load code')).not.toBeInTheDocument();
  });

  test('ESC 키로 모달이 닫힌다', async () => {
    apiRequest.mockResolvedValueOnce({ codes: [] });
    render(<CodeEditor />);
    await userEvent.click(screen.getByRole('button', { name: /load/i }));
    expect(screen.getByText('Load code')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('Load code')).not.toBeInTheDocument();
  });
});
