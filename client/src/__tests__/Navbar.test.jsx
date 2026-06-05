import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Navbar from '../components/Navbar';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

let mockUser = null;
const mockLogout = vi.fn();
const mockUpdateUser = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, logout: mockLogout, updateUser: mockUpdateUser }),
}));

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from '../utils/api';

afterEach(() => cleanup());

beforeEach(() => {
  vi.resetAllMocks();
  mockUser = null;
});

describe('Navbar — logo', () => {
  test('brand logo links to landing (/)', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: /ajas editor/i })).toHaveAttribute('href', '/');
  });
});

describe('Navbar — logged out', () => {
  test('shows Sign in and Get started links', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/register');
  });

  test('does not render the profile avatar', () => {
    render(<Navbar />);
    expect(screen.queryByRole('button', { name: /profile/i })).not.toBeInTheDocument();
  });
});

describe('Navbar — logged in', () => {
  beforeEach(() => {
    mockUser = { email: 'a@a.com', nickname: 'Val', theme: 'dark', fontSize: 14 };
  });

  test('shows Dashboard link and profile avatar', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
  });

  test('does not show Sign in / Get started', () => {
    render(<Navbar />);
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /get started/i })).not.toBeInTheDocument();
  });

  test('settings are hidden until the avatar is clicked', () => {
    render(<Navbar />);
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });
});

describe('Navbar — profile popover', () => {
  beforeEach(() => {
    mockUser = { email: 'a@a.com', nickname: 'Val', theme: 'dark', fontSize: 14 };
  });

  async function openPopover() {
    await userEvent.click(screen.getByRole('button', { name: /profile/i }));
  }

  test('clicking the avatar opens the popover with Logout', async () => {
    render(<Navbar />);
    await openPopover();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  test('Escape closes the popover', async () => {
    render(<Navbar />);
    await openPopover();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  test('theme toggle calls PUT /auth/me with the other theme', async () => {
    apiRequest.mockResolvedValue({ user: { ...mockUser, theme: 'light' } });
    render(<Navbar />);
    await openPopover();
    await userEvent.click(screen.getByRole('button', { name: /theme/i }));
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        '/auth/me',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"theme":"light"'),
        }),
      );
    });
  });

  test('increase font calls PUT /auth/me with fontSize+1', async () => {
    apiRequest.mockResolvedValue({ user: { ...mockUser, fontSize: 15 } });
    render(<Navbar />);
    await openPopover();
    await userEvent.click(screen.getByRole('button', { name: /increase font/i }));
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        '/auth/me',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"fontSize":15'),
        }),
      );
    });
  });

  test('decrease font is disabled at minimum size', async () => {
    mockUser = { ...mockUser, fontSize: 12 };
    render(<Navbar />);
    await openPopover();
    expect(screen.getByRole('button', { name: /decrease font/i })).toBeDisabled();
  });

  test('password change submits PUT /auth/password', async () => {
    apiRequest.mockResolvedValue({ message: 'ok' });
    render(<Navbar />);
    await openPopover();
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
        }),
      );
    });
  });

  test('WRONG_PASSWORD shows an error message', async () => {
    apiRequest.mockRejectedValueOnce(Object.assign(new Error(), { errorCode: 'WRONG_PASSWORD' }));
    render(<Navbar />);
    await openPopover();
    await userEvent.click(screen.getByRole('button', { name: /change/i }));
    await userEvent.type(screen.getByPlaceholderText(/current password/i), 'wrong');
    await userEvent.type(screen.getByPlaceholderText(/new password/i), 'newpass1');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() => {
      expect(screen.getByText(/incorrect.*password/i)).toBeInTheDocument();
    });
  });

  test('Logout calls logout() and navigates to /login', async () => {
    render(<Navbar />);
    await openPopover();
    await userEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

describe('Navbar — editor mode', () => {
  beforeEach(() => {
    mockUser = { email: 'a@a.com', nickname: 'Val', theme: 'dark', fontSize: 14 };
  });

  function renderEditor(props = {}) {
    return render(
      <Navbar
        editor
        name="main"
        onNameChange={vi.fn()}
        ext="js"
        dirty={false}
        onSave={vi.fn()}
        onRun={vi.fn()}
        onLoad={vi.fn()}
        running={false}
        {...props}
      />,
    );
  }

  test('renders Save / Run / Load and the file name input', () => {
    renderEditor();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Untitled')).toHaveValue('main');
  });

  test('still shows Dashboard link and profile avatar', () => {
    renderEditor();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
  });

  test('shows the dirty dot when dirty', () => {
    renderEditor({ dirty: true });
    expect(screen.getByTitle('Unsaved changes')).toBeInTheDocument();
  });

  test('clicking Save calls onSave', async () => {
    const onSave = vi.fn();
    renderEditor({ onSave });
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSave).toHaveBeenCalled();
  });

  test('Run is disabled while running', () => {
    renderEditor({ running: true });
    expect(screen.getByRole('button', { name: /running/i })).toBeDisabled();
  });
});
