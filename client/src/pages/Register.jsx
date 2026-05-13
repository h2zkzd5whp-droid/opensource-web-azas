import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import styles from '../styles/Register.module.css';

const ERROR_MESSAGES = {
  FIELD_MISSING: 'Please fill in all fields.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  NICKNAME_EMPTY: 'Please enter a nickname.',
  EMAIL_DUPLICATE: 'This email is already in use.',
};

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, nickname }),
      });
      navigate('/login');
    } catch (err) {
      const msg = ERROR_MESSAGES[err.errorCode] || err.message || 'Registration failed.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.brand}>
        <span className={styles.brandPrompt}>&gt;_</span>
        <span className={styles.brandName}>Code Editor</span>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Start coding in seconds</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>✉</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className={styles.input}
              />
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Nickname</span>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>@</span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="your nickname"
                autoComplete="nickname"
                required
                className={styles.input}
              />
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className={styles.input}
              />
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Confirm Password</span>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className={styles.input}
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className={styles.submitBtn}
          >
            {submitting ? 'Creating account...' : 'Sign Up →'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
