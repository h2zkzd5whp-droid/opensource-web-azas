import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CodeEditor from '../pages/CodeEditor';

const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'a@a.com', theme: 'dark', fontSize: 14 },
    logout: vi.fn(),
    updateUser: vi.fn(),
  }),
}));

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from '../utils/api';

vi.mock('../hooks/useCodeExecution', () => ({
  default: () => ({ result: null, loading: false, error: null, run: vi.fn() }),
}));

// Monaco 에디터는 jsdom에서 동작하지 않으므로 stub
vi.mock('../components/Editor', () => ({
  default: ({ onChange }) => (
    <textarea data-testid="editor" onChange={(e) => onChange(e.target.value)} />
  ),
}));

// LoadCodeModal stub — Step 6에서 vi.doUnmock으로 실제 컴포넌트를 사용
vi.mock('../components/LoadCodeModal', () => ({
  default: ({ open }) => (open ? <div data-testid="load-modal" /> : null),
}));

function renderCodeEditor() {
  return render(<CodeEditor />);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseParams.mockReturnValue({});
});

describe('CodeEditor — Step 1: 기본 렌더링', () => {
  test('Navbar의 Save 버튼이 렌더된다', () => {
    renderCodeEditor();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  test('Navbar의 Run 버튼이 렌더된다', () => {
    renderCodeEditor();
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument();
  });

  test('Navbar의 Load 버튼이 렌더된다', () => {
    renderCodeEditor();
    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
  });

  test('Navbar의 Dashboard 링크가 렌더된다', () => {
    renderCodeEditor();
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
  });

  test('파일명 입력 필드가 렌더된다', () => {
    renderCodeEditor();
    expect(screen.getByPlaceholderText('Untitled')).toBeInTheDocument();
  });

  test('에디터 영역이 렌더된다', () => {
    renderCodeEditor();
    expect(screen.getByTestId('editor')).toBeInTheDocument();
  });

  test('LanguageSelector에 JavaScript 버튼이 렌더된다', () => {
    renderCodeEditor();
    expect(screen.getByRole('button', { name: /javascript/i })).toBeInTheDocument();
  });

  test('초기 상태에서 dirty dot이 없다', () => {
    renderCodeEditor();
    expect(screen.queryByTitle('Unsaved changes')).not.toBeInTheDocument();
  });
});

describe('CodeEditor — Step 2: codeId 진입 시 코드 로드', () => {
  test('codeId가 있으면 GET /code/:id를 호출한다', async () => {
    mockUseParams.mockReturnValue({ codeId: '42' });
    apiRequest.mockResolvedValueOnce({
      language: 'python',
      source: 'print("hi")',
      title: 'hello.py',
    });

    renderCodeEditor();

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/code/42');
    });
  });

  test('로드 성공 시 파일명(확장자 제외)이 Navbar에 반영된다', async () => {
    mockUseParams.mockReturnValue({ codeId: '42' });
    apiRequest.mockResolvedValueOnce({
      language: 'python',
      source: 'print("hi")',
      title: 'hello.py',
    });

    renderCodeEditor();

    await waitFor(() => {
      expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
    });
  });

  test('403 응답 시 /dashboard로 navigate한다', async () => {
    mockUseParams.mockReturnValue({ codeId: '99' });
    apiRequest.mockRejectedValueOnce(Object.assign(new Error(), { errorCode: 'FORBIDDEN' }));

    renderCodeEditor();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('404 응답 시 /dashboard로 navigate한다', async () => {
    mockUseParams.mockReturnValue({ codeId: '99' });
    apiRequest.mockRejectedValueOnce(Object.assign(new Error(), { errorCode: 'NOT_FOUND' }));

    renderCodeEditor();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('codeId가 없으면 apiRequest를 호출하지 않는다', () => {
    renderCodeEditor();
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('CodeEditor — Step 3: dirty 상태 & 언어 변경 흐름', () => {
  test('에디터 내용 변경 시 dirty dot이 나타난다', async () => {
    renderCodeEditor();
    await userEvent.type(screen.getByTestId('editor'), 'x');
    expect(screen.getByTitle('Unsaved changes')).toBeInTheDocument();
  });

  test('파일명 변경 시 dirty dot이 나타난다', async () => {
    renderCodeEditor();
    await userEvent.type(screen.getByPlaceholderText('Untitled'), 'main');
    expect(screen.getByTitle('Unsaved changes')).toBeInTheDocument();
  });

  test('dirty 없이 언어 변경 시 ConfirmModal이 뜨지 않는다', async () => {
    renderCodeEditor();
    await userEvent.click(screen.getByRole('button', { name: /python/i }));
    expect(screen.queryByText('Switch language?')).not.toBeInTheDocument();
  });

  test('dirty 상태에서 언어 변경 시 ConfirmModal이 뜬다', async () => {
    renderCodeEditor();
    await userEvent.type(screen.getByTestId('editor'), 'x');
    await userEvent.click(screen.getByRole('button', { name: /python/i }));
    expect(screen.getByText('Switch language?')).toBeInTheDocument();
  });

  test('ConfirmModal에서 Cancel 클릭 시 언어가 바뀌지 않는다', async () => {
    renderCodeEditor();
    await userEvent.type(screen.getByTestId('editor'), 'x');
    await userEvent.click(screen.getByRole('button', { name: /python/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText('Switch language?')).not.toBeInTheDocument();
    // 확장자가 js 그대로
    expect(screen.getByText('.js')).toBeInTheDocument();
  });

  test('ConfirmModal에서 Switch 클릭 시 언어가 변경된다', async () => {
    renderCodeEditor();
    await userEvent.type(screen.getByTestId('editor'), 'x');
    await userEvent.click(screen.getByRole('button', { name: /python/i }));
    await userEvent.click(screen.getByRole('button', { name: /switch/i }));
    expect(screen.queryByText('Switch language?')).not.toBeInTheDocument();
    expect(screen.getByText('.py')).toBeInTheDocument();
  });

  test('언어 변경 확정 후 dirty가 해제된다', async () => {
    renderCodeEditor();
    await userEvent.type(screen.getByTestId('editor'), 'x');
    await userEvent.click(screen.getByRole('button', { name: /python/i }));
    await userEvent.click(screen.getByRole('button', { name: /switch/i }));
    expect(screen.queryByTitle('Unsaved changes')).not.toBeInTheDocument();
  });

  test('같은 언어 재선택 시 ConfirmModal이 뜨지 않는다', async () => {
    renderCodeEditor();
    await userEvent.type(screen.getByTestId('editor'), 'x');
    await userEvent.click(screen.getByRole('button', { name: /javascript/i }));
    expect(screen.queryByText('Switch language?')).not.toBeInTheDocument();
  });
});

describe('CodeEditor — Step 4: 저장 흐름', () => {
  test('신규 저장(codeId 없음) 시 POST /code를 호출한다', async () => {
    apiRequest.mockResolvedValueOnce({ codeId: 7 });
    renderCodeEditor();
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/code', expect.objectContaining({ method: 'POST' }));
    });
  });

  test('신규 저장 성공 후 /code/:id로 navigate한다', async () => {
    apiRequest.mockResolvedValueOnce({ codeId: 7 });
    renderCodeEditor();
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/code/7', { replace: true });
    });
  });

  test('신규 저장 성공 후 dirty가 해제된다', async () => {
    apiRequest.mockResolvedValueOnce({ codeId: 7 });
    renderCodeEditor();
    await userEvent.type(screen.getByTestId('editor'), 'x');
    expect(screen.getByTitle('Unsaved changes')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(screen.queryByTitle('Unsaved changes')).not.toBeInTheDocument();
    });
  });

  test('기존 저장(codeId 있음) 시 PUT /code/:id를 호출한다', async () => {
    mockUseParams.mockReturnValue({ codeId: '42' });
    apiRequest
      .mockResolvedValueOnce({ language: 'javascript', source: 'x', title: 'foo.js' }) // GET
      .mockResolvedValueOnce({}); // PUT
    renderCodeEditor();
    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith('/code/42'));
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/code/42', expect.objectContaining({ method: 'PUT' }));
    });
  });

  test('기존 저장 성공 후 dirty가 해제된다', async () => {
    mockUseParams.mockReturnValue({ codeId: '42' });
    apiRequest
      .mockResolvedValueOnce({ language: 'javascript', source: 'x', title: 'foo.js' })
      .mockResolvedValueOnce({});
    renderCodeEditor();
    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith('/code/42'));
    await userEvent.type(screen.getByTestId('editor'), 'y');
    expect(screen.getByTitle('Unsaved changes')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(screen.queryByTitle('Unsaved changes')).not.toBeInTheDocument();
    });
  });

  test('Ctrl+S로 저장이 트리거된다', async () => {
    apiRequest.mockResolvedValueOnce({ codeId: 5 });
    renderCodeEditor();
    await userEvent.keyboard('{Control>}s{/Control}');
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/code', expect.objectContaining({ method: 'POST' }));
    });
  });

  test('파일명 없이 저장 시 title이 Untitled.<ext>가 된다', async () => {
    apiRequest.mockResolvedValueOnce({ codeId: 3 });
    renderCodeEditor();
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      const body = JSON.parse(apiRequest.mock.calls[0][1].body);
      expect(body.title).toBe('Untitled.js');
    });
  });
});
