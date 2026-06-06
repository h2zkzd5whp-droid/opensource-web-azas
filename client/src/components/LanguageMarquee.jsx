import styles from '../styles/LanguageMarquee.module.css';

const LANGUAGES = [
  { name: 'Python',     ver: 'v3.12',   color: '#3b82f6' },
  { name: 'JavaScript', ver: 'ES2024',  color: '#f7b731' },
  { name: 'TypeScript', ver: 'v5.4',    color: '#2563eb' },
  { name: 'Rust',       ver: 'v1.78',   color: '#f97316' },
  { name: 'Go',         ver: 'v1.22',   color: '#00acd7' },
  { name: 'C++',        ver: 'C++23',   color: '#9333ea' },
  { name: 'Java',       ver: 'v21 LTS', color: '#e84d3d' },
];

export default function LanguageMarquee() {
  const doubled = [...LANGUAGES, ...LANGUAGES];

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>SUPPORTED LANGUAGES</p>
        <div className={styles.track}>
          {doubled.map((lang, i) => (
            <div className={styles.card} key={i}>
              <span
                className={styles.dot}
                style={{ background: lang.color }}
              />
              <span className={styles.name}>{lang.name}</span>
              <span className={styles.ver}>{lang.ver}</span>
            </div>
          ))}
        </div>
      </div>
  );
}
