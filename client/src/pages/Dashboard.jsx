import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import ThemeApplier from '../components/ThemeApplier';
import { LANG_ICONS } from '../utils/languageIcons';
import styles from '../styles/Dashboard.module.css';

function formatDate(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 14) return '1w ago';
  return `${Math.floor(days / 7)}w ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [codes, setCodes] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function loadCodes() {
    apiRequest('/code').then((data) => setCodes(data?.codes ?? []));
  }

  useEffect(() => {
    loadCodes();
  }, []);

  function handleNewProject() {
    navigate('/code');
  }

  function handleOpenProject(codeId) {
    navigate(`/code/${codeId}`);
  }

  function handleDeleteClick(e, code) {
    e.stopPropagation();
    setDeleteTarget(code);
  }

  async function handleDeleteConfirm() {
    await apiRequest(`/code/${deleteTarget.codeId}`, { method: 'DELETE' });
    setDeleteTarget(null);
    loadCodes();
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
      setShowPasswordForm(false);
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      if (err.errorCode === 'WRONG_PASSWORD') {
        setPasswordError('Incorrect current password.');
      } else {
        setPasswordError('Failed to change password.');
      }
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const avatarInitial = (user?.nickname || user?.email || '?')[0].toUpperCase();
  const fontSize = user?.fontSize || 14;

  return (
    <div className={styles.page}>
      <ThemeApplier theme={user?.theme} />
      <div className={styles.dash}>
        {/* Top bar */}
        <div className={styles.dashBar}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>AJAS</span>
            <span className={styles.brandName}>editor</span>
          </div>
          <div className={styles.barRight}>
            <div className={styles.avatar} title={user?.nickname || user?.email}>
              {avatarInitial}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className={styles.dashGrid}>
          {/* Projects panel */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h4 className={styles.panelTitle}>Projects</h4>
              <span className={styles.count}>{codes.length} saved</span>
            </div>

            {codes.length === 0 ? (
              <div className={styles.empty}>
                <h5>No projects yet</h5>
                <p>Create your first snippet — it&apos;ll show up here after the first save.</p>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleNewProject}
                >
                  + New project
                </button>
              </div>
            ) : (
              <div className={styles.panelBody}>
                <div className={styles.projectGrid}>
                  {codes.map((code) => {
                    const Icon = LANG_ICONS[code.language];
                    return (
                      <div
                        key={code.codeId}
                        className={styles.project}
                        onClick={() => handleOpenProject(code.codeId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleOpenProject(code.codeId)}
                      >
                        <div className={styles.projectHead}>
                          <h5 className={styles.projectTitle}>{code.title}</h5>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            aria-label={`delete ${code.title}`}
                            title="Delete"
                            onClick={(e) => handleDeleteClick(e, code)}
                          >
                            ×
                          </button>
                        </div>
                        <div className={styles.projectFoot}>
                          <span className={styles.langBadge}>
                            {Icon && <Icon size={14} />}
                            {code.language}
                          </span>
                          <span>{formatDate(code.updatedAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Settings panel */}
          <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h4 className={styles.panelTitle}>Settings</h4>
              </div>
              <div className={styles.panelBody}>
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
                  <button
                    type="button"
                    className={styles.btnGhost}
                    onClick={() => {
                      setShowPasswordForm((v) => !v);
                      setPasswordError('');
                      setOldPassword('');
                      setNewPassword('');
                    }}
                  >
                    Change
                  </button>
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
                    <button type="submit" className={styles.btnPrimary}>
                      Save
                    </button>
                  </form>
                )}

                {/* Logout */}
                <div className={styles.setting}>
                  <div className={styles.labelBlock}>
                    <span className={styles.settingName}>Session</span>
                    <span className={styles.settingDesc}>Sign out of this browser</span>
                  </div>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete project"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
