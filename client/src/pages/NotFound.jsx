import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from '../styles/NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.shell}>
      <Navbar />
      <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.codeNum}>404</p>
        <p className={styles.codeSub}>PAGE NOT FOUND</p>
        <h1 className={styles.title}>This route doesn't exist</h1>
        <p className={styles.desc}>
          The URL you opened isn't part of this app. Head back to something familiar.
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.btn}>Go home</Link>
          <Link to="/dashboard" className={styles.btnGhost}>Dashboard</Link>
        </div>
      </div>
      </div>
    </div>
  );
}
