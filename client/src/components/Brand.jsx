import styles from '../styles/Brand.module.css';

// Geometric "A" mark with high/low stroke contrast (thick left leg, thin right
// leg) for a hand-cut, typographic feel. Single fill via currentColor so it
// adapts to light/dark.
function Logo() {
  return (
    <svg
      className={styles.logo}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* left leg — thick downstroke */}
      <path d="M11 3 L13 3 L8.2 21 L5 21 Z" />
      {/* right leg — thin upstroke */}
      <path d="M13 3 L14.2 3 L19 21 L17.6 21 Z" />
      {/* crossbar */}
      <path d="M8.6 12 L16 12 L15.5 14 L8.1 14 Z" />
    </svg>
  );
}

// Shared brand mark. Renders as a button (Toolbar onHome) or any element via
// `as` (e.g. react-router Link). Logo only — accessible name kept for a11y/tests.
export default function Brand({ as: Component = 'span', className = '', ...rest }) {
  const classes = [styles.brand, className].filter(Boolean).join(' ');
  const extra = Component === 'button' ? { type: 'button' } : {};

  return (
    <Component className={classes} {...extra} {...rest}>
      <Logo />
      <span className={styles.srOnly}>AJAS editor</span>
    </Component>
  );
}
