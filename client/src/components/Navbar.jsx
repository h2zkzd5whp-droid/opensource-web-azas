import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import useEscapeKey from '../hooks/useEscapeKey';
import Brand from './Brand';
import Button from './Button';
import styles from '../styles/Navbar.module.css';

// Shared top bar across every page. Logo always returns to the landing page.
// Logged out → Sign in / Get started. Logged in → Dashboard link + profile
// popover (theme/font/password/logout). `editor` mode adds the file controls
// previously owned by Toolbar (name input · Load · Save · ▶ Run).
export default function Navbar({
  editor = false,
  transparent = false,
  name,
  onNameChange,
  ext,
  dirty,
  onSave,
  onRun,
  onLoad,
  running,
}) {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const popoverRef = useRef(null);

  function resetPasswordForm() {
    setShowPasswordForm(false);
    setPasswordError('');
    setOldPassword('');
    setNewPassword('');
  }

  function closePopover() {
    setPopoverOpen(false);
    resetPasswordForm();
  }

  useEscapeKey(popoverOpen, closePopover);

  function handleBackdropClick(e) {
    if (popoverRef.current && !popoverRef.current.contains(e.target)) closePopover();
  }

  async function handleThemeToggle() {
    const nextTheme = user.theme === 'dark' ? 'light' : 'dark';
    const data = await apiRequest('/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ theme: nextTheme }),
    });
    if (data?.user) updateUser(data.user);
  }

  async function handleFontChange(delta) {
    const next = (user.fontSize || 14) + delta;
    if (next < 12 || next > 24) return;
    const data = await apiRequest('/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ fontSize: next }),
    });
    if (data?.user) updateUser(data.user);
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    setPasswordError('');
    try {
      await apiRequest('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      resetPasswordForm();
    } catch (err) {
      if (err.errorCode === 'WRONG_PASSWORD') {
        setPasswordError('Incorrect current password.');
      } else {
        setPasswordError('Failed to change password.');
      }
    }
  }

  function togglePasswordForm() {
    if (showPasswordForm) resetPasswordForm();
    else setShowPasswordForm(true);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const avatarInitial = (user?.nickname || user?.email || '?')[0].toUpperCase();
  const fontSize = user?.fontSize || 14;

  return (
    <header className={`${styles.bar} ${transparent ? styles.transparent : ''}`}>
      <div className={styles.left}>
        <Brand as={Link} to="/" className={styles.brand} />
        {editor && (
          <div className={styles.fileTitle}>
            <span className={styles.fileSep}>/</span>
            <input
              className={styles.fileName}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Untitled"
              spellCheck={false}
            />
            <span className={styles.fileExt}>.{ext}</span>
            {dirty && <span className={styles.dirtyDot} title="Unsaved changes" />}
          </div>
        )}
      </div>

      <div className={styles.right}>
        {user ? (
          <>
            <Link to="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
            {editor && (
              <>
                <button type="button" className={styles.navLink} onClick={onLoad}>
                  Load
                </button>
                <button type="button" className={styles.navLink} onClick={onSave}>
                  Save
                </button>
                <button
                  type="button"
                  className={styles.navLink}
                  onClick={onRun}
                  disabled={running}
                >
                  {running ? 'Running…' : '▶  Run'}
                </button>
              </>
            )}
            <div className={styles.profile}>
              <button
                type="button"
                className={styles.avatar}
                aria-label="profile"
                title={user?.nickname || user?.email}
                onClick={() => (popoverOpen ? closePopover() : setPopoverOpen(true))}
              >
                {avatarInitial}
              </button>

              {popoverOpen && (
                <>
                  <div className={styles.backdrop} onClick={handleBackdropClick} />
                  <div className={styles.popover} ref={popoverRef}>
                    {/* Theme */}
                    <div className={styles.setting}>
                      <div className={styles.labelBlock}>
                        <span className={styles.settingName}>Theme</span>
                        <span className={styles.settingDesc}>Editor appearance</span>
                      </div>
                      <button
                        type="button"
                        className={`${styles.toggle} ${user?.theme !== 'dark' ? styles.toggleOff : ''}`}
                        aria-label="theme"
                        title={user?.theme}
                        onClick={handleThemeToggle}
                      />
                    </div>

                    {/* Font size */}
                    <div className={styles.setting}>
                      <div className={styles.labelBlock}>
                        <span className={styles.settingName}>Font size</span>
                        <span className={styles.settingDesc}>12–24</span>
                      </div>
                      <div className={styles.stepper}>
                        <button
                          type="button"
                          aria-label="decrease font"
                          disabled={fontSize <= 12}
                          onClick={() => handleFontChange(-1)}
                        >
                          −
                        </button>
                        <span className={styles.stepperVal}>{fontSize}</span>
                        <button
                          type="button"
                          aria-label="increase font"
                          disabled={fontSize >= 24}
                          onClick={() => handleFontChange(1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div className={styles.setting}>
                      <div className={styles.labelBlock}>
                        <span className={styles.settingName}>Password</span>
                        <span className={styles.settingDesc}>Change password</span>
                      </div>
                      <Button
                        variant="ghost"
                        aria-label="change password"
                        onClick={togglePasswordForm}
                      >
                        Change
                      </Button>
                    </div>

                    {showPasswordForm && (
                      <form className={styles.passwordForm} onSubmit={handlePasswordSave}>
                        {passwordError && (
                          <div className={styles.errorBanner}>{passwordError}</div>
                        )}
                        <input
                          className={styles.input}
                          type="password"
                          placeholder="Current password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <input
                          className={styles.input}
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Button type="submit" variant="primary">
                          Save
                        </Button>
                      </form>
                    )}

                    {/* Logout */}
                    <div className={styles.setting}>
                      <div className={styles.labelBlock}>
                        <span className={styles.settingName}>Session</span>
                        <span className={styles.settingDesc}>Sign out of this browser</span>
                      </div>
                      <Button variant="danger" onClick={handleLogout}>
                        Logout
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.navLink}>
              Sign in
            </Link>
            <Link to="/register" className={styles.navLink}>
              Get started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
