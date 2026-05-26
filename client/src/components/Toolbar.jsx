import LanguageBadge from './LanguageBadge';
import styles from '../styles/Editor.module.css';

// 상단 앱바. 파일명·언어·저장·실행 컨트롤 표시
export default function Toolbar({
  name,
  onNameChange,
  extension,
  language,
  dirty,
  onSave,
  onRun,
  running,
}) {
  return (
    <div className={styles.appBar}>
      <div className={styles.appBarLeft}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>AJAS</span>
          <span className={styles.brandName}>editor</span>
        </div>
        <div className={styles.fileTitle}>
          <span className={styles.fileSep}>/</span>
          <input
            className={styles.fileName}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Untitled"
            spellCheck={false}
          />
          <span className={styles.fileExt}>.{extension}</span>
          {dirty && <span className={styles.dirtyDot} title="Unsaved changes" />}
        </div>
      </div>
      <div className={styles.appBarRight}>
        <LanguageBadge language={language} />
        <button type="button" className={styles.btnGhost} onClick={onSave}>
          Save
        </button>
        <button type="button" className={styles.btnPrimary} onClick={onRun} disabled={running}>
          {running ? 'Running…' : '▶  Run'}
        </button>
      </div>
    </div>
  );
}
