import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Login.module.css';

const ERROR_MESSAGES = {
  WRONG_PASSWORD: 'Incorrect email or password.',
  FIELD_MISSING: 'Please enter your email and password.',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = ERROR_MESSAGES[err.errorCode] || err.message || 'Login failed.';
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
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

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
            <span className={styles.label}>Password</span>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
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
            {submitting ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/register" className={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
