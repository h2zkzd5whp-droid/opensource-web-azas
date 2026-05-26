import { SUPPORTED_LANGUAGES } from '../utils/constants';
import styles from '../styles/Editor.module.css';

const SHORT_LABEL = {
  javascript: 'JS',
  python: 'PY',
  java: 'JA',
};

const DOT_COLOR = {
  javascript: '#eab308',
  python: '#3b82f6',
  java: '#ef4444',
};

// 좌측 사이드 패널. 언어 아이콘 세로 배치, 클릭으로 변경
export default function LanguageSelector({ language, onSelect }) {
  return (
    <div className={styles.side}>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = lang.id === language;
        return (
          <button
            key={lang.id}
            type="button"
            className={`${styles.sideBtn} ${isActive ? styles.sideBtnActive : ''}`}
            onClick={() => onSelect(lang.id)}
            title={lang.label}
            aria-label={lang.label}
            aria-pressed={isActive}
          >
            <span className={styles.sideDot} style={{ background: DOT_COLOR[lang.id] }} />
            {SHORT_LABEL[lang.id]}
          </button>
        );
      })}
    </div>
  );
}
