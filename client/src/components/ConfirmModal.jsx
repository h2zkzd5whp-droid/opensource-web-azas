import Button from './Button';
import useEscapeKey from '../hooks/useEscapeKey';
import styles from '../styles/ConfirmModal.module.css';

// 위험·되돌릴 수 없는 액션 직전에 한 번 더 확인받는 모달
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  // ESC로 취소
  useEscapeKey(open, onCancel);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.actions}>
          <Button variant="ghost" size="modal" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" size="modal" onClick={onConfirm} autoFocus>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
