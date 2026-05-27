import { SUPPORTED_LANGUAGES } from '../utils/constants';
import { LANG_ICONS } from '../utils/languageIcons.jsx';
import styles from '../styles/Editor.module.css';

// 좌측 사이드 패널. 언어 공식 로고 세로 배치, 클릭으로 변경
export default function LanguageSelector({ language, onSelect }) {
  return (
    <div className={styles.side}>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const Icon = LANG_ICONS[lang.id];
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
            {Icon && <Icon />}
          </button>
        );
      })}
    </div>
  );
}
