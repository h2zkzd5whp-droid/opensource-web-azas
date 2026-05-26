import { SUPPORTED_LANGUAGES } from '../utils/constants';
import styles from '../styles/Editor.module.css';

const DOT_COLOR = {
  javascript: '#eab308',
  python: '#3b82f6',
  java: '#ef4444',
};

// 현재 언어를 도트와 라벨로 표시
export default function LanguageBadge({ language }) {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.id === language);
  if (!lang) return null;

  return (
    <span className={styles.langBadge}>
      <span className={styles.langDot} style={{ background: DOT_COLOR[language] }} />
      {lang.id}
    </span>
  );
}
