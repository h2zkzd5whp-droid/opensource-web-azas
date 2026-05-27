import { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api';
import styles from '../styles/LoadCodeModal.module.css';

// 날짜 포맷. YYYY-MM-DD HH:MM
const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// 저장된 코드 목록 모달. 선택 시 onSelect(codeId) 호출
export default function LoadCodeModal({ open, onSelect, onClose }) {
  const [codes, setCodes] = useState(null);
  const [error, setError] = useState(null);
  const [prevOpen, setPrevOpen] = useState(open);

  // open이 false→true로 바뀌는 시점에 상태 초기화. 효과 대신 prev-prop 패턴
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setCodes(null);
      setError(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    let active = true;
    apiRequest('/code')
      .then((data) => {
        if (!active) return;
        const list = [...(data.codes ?? [])].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        );
        setCodes(list);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Failed to load.');
        setCodes([]);
      });
    return () => { active = false; };
  }, [open]);

  // ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h3 className={styles.title}>Load code</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className={styles.body}>
          {codes === null && <div className={styles.loading}>Loading…</div>}
          {codes !== null && codes.length === 0 && (
            <div className={styles.empty}>{error ?? 'No saved code yet.'}</div>
          )}
          {codes !== null && codes.length > 0 && codes.map((c) => (
            <button
              key={c.codeId}
              type="button"
              className={styles.row}
              onClick={() => onSelect(c.codeId)}
            >
              <div className={styles.rowMain}>
                <span className={styles.rowTitle}>{c.title}</span>
                <span className={styles.rowMeta}>{formatDate(c.updatedAt)}</span>
              </div>
              <span className={styles.rowLang}>{c.language}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
