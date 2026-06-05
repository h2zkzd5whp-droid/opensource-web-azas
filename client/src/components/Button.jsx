import styles from '../styles/Button.module.css';

// Shared button. Renders as <button> by default, or any element via `as`
// (e.g. react-router Link). variant/size/fullWidth map to Button.module.css.
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'sm',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const extra = Component === 'button' ? { type: rest.type ?? 'button' } : {};

  return (
    <Component className={classes} {...extra} {...rest}>
      {children}
    </Component>
  );
}
