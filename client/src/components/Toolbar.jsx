import Button from './Button';
import Brand from './Brand';
import styles from '../styles/Editor.module.css';

// 상단 앱바. 브랜드(랜딩 이동)·파일명·대시보드·로드·저장·실행 컨트롤
export default function Toolbar({
  name,
  onNameChange,
  extension,
  dirty,
  onSave,
  onRun,
  onLoad,
  onDashboard,
  onHome,
  running,
}) {
  return (
    <div className={styles.appBar}>
      <div className={styles.appBarLeft}>
        <Brand as="button" onClick={onHome} className={styles.brand} />
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
        <Button variant="ghost" onClick={onDashboard}>
          Dashboard
        </Button>
        <Button variant="ghost" onClick={onLoad}>
          Load
        </Button>
        <Button variant="ghost" onClick={onSave}>
          Save
        </Button>
        <Button variant="primary" onClick={onRun} disabled={running}>
          {running ? 'Running…' : '▶  Run'}
        </Button>
      </div>
    </div>
  );
}
