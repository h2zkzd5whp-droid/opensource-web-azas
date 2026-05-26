import { useState } from 'react';
import styles from '../styles/Editor.module.css';

// 코드 실행 결과 표시 패널. stdout/stderr 탭, exit·시간 메타. height는 외부에서 주입(드래그 리사이즈)
export default function ExecutionPanel({ result, loading, error, height }) {
  const [tab, setTab] = useState('stdout');
  const [prevResult, setPrevResult] = useState(result);

  // 새 결과 도착 시 stderr 우선. 효과 대신 prev-prop 패턴으로 동기 setState 회피
  if (prevResult !== result) {
    setPrevResult(result);
    if (result) setTab(result.stderr ? 'stderr' : 'stdout');
  }

  const hasResult = !!result;
  const exitOk = hasResult && result.exitCode === 0;
  const body = hasResult ? (tab === 'stdout' ? result.stdout : result.stderr) : '';

  return (
    <div className={styles.terminal} style={height ? { height } : undefined}>
      <div className={styles.terminalHead}>
        <div className={styles.termTabs}>
          <button
            type="button"
            className={`${styles.termTab} ${tab === 'stdout' ? styles.termTabActive : ''}`}
            onClick={() => setTab('stdout')}
          >
            stdout
          </button>
          <button
            type="button"
            className={`${styles.termTab} ${tab === 'stderr' ? styles.termTabActive : ''}`}
            onClick={() => setTab('stderr')}
          >
            stderr
          </button>
        </div>
        <div className={styles.termMeta}>
          {loading && <span className={styles.termDim}>running…</span>}
          {!loading && hasResult && (
            <>
              <span className={exitOk ? styles.termOk : styles.termErr}>
                exit {result.exitCode}
              </span>
              <span>{result.executionTime} ms</span>
            </>
          )}
          {!loading && !hasResult && !error && (
            <span className={styles.termDim}>— not run yet —</span>
          )}
        </div>
      </div>
      <div className={styles.terminalBody}>
        {loading && <span className={styles.termDim}>Running…</span>}
        {!loading && error && <span className={styles.termErr}>{error}</span>}
        {!loading && !error && hasResult && (
          body ? <pre className={styles.termOutput}>{body}</pre>
               : <span className={styles.termDim}>(empty)</span>
        )}
        {!loading && !error && !hasResult && (
          <span className={styles.termDim}>Output appears here. Press Run.</span>
        )}
      </div>
    </div>
  );
}
