import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import ThemeApplier from '../components/ThemeApplier';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { LANG_ICONS } from '../utils/languageIcons';
import { formatRelative } from '../utils/date';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [codes, setCodes] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
    try {
      await apiRequest(`/code/${deleteTarget.codeId}`, { method: 'DELETE' });
      setDeleteTarget(null);
      loadCodes();
    } catch {
      setDeleteTarget(null);
    }
  }

  return (
    <div className={styles.page}>
      <ThemeApplier theme={user?.theme} />
      <Navbar />

      <main className={styles.content}>
        <div className={styles.panelHead}>
          <h4 className={styles.panelTitle}>Projects</h4>
          <span className={styles.count}>{codes.length} saved</span>
        </div>

        {codes.length === 0 ? (
          <div className={styles.empty}>
            <h5>No projects yet</h5>
            <p>Create your first snippet — it&apos;ll show up here after the first save.</p>
            <Button variant="primary" onClick={handleNewProject}>
              + New project
            </Button>
          </div>
        ) : (
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
                    <span>{formatRelative(code.updatedAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

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
