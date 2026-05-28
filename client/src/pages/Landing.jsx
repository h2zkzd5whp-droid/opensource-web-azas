import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/landing_image.png';
import s from '../styles/Landing.module.css';

export default function Landing() {
  const pageRef = useRef(null);
  const heroWrapRef = useRef(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    function onScroll() {
      const wrap = heroWrapRef.current;
      if (!wrap) return;
      const { top, height } = wrap.getBoundingClientRect();
      const scrolled = -top;
      const sectionH = height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / sectionH));

      if (progress < 0.33) setStep(0);
      else if (progress < 0.66) setStep(1);
      else setStep(2);
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={s.page} ref={pageRef}>
      {/* ===== Sticky hero section ===== */}
      <div className={s.heroWrap} ref={heroWrapRef} style={{ '--hero-img': `url(${heroBg})` }}>
        <div className={s.heroSticky}>
          <div className={s.heroBg} />
          <div className={s.heroOverlay} />

          {/* Nav */}
          <nav className={s.nav}>
            <Link to="/" className={s.brand}>
              <span className={s.brandMark}>AJAS</span>
              <span className={s.brandName}>editor</span>
            </Link>
            <div className={s.navActions}>
              <Link to="/login" className={s.btnGhost}>Sign in</Link>
              <Link to="/register" className={s.btnPrimary}>Get started</Link>
            </div>
          </nav>

          {/* Hero content — steps */}
          <div className={s.heroContent}>
            {/* Step 0: CTA */}
            <div className={`${s.step} ${step === 0 ? s.stepVisible : s.stepHidden}`}>
              <p className={s.eyebrow}>Ready to start?</p>
              <h1 className={s.heroTitle}>Open the editor.<br /><span className={s.accent}>// no setup required.</span></h1>
              <div className={s.ctaActions}>
                <Link to="/code" className={s.btnPrimaryLg}>Open editor →</Link>
                <Link to="/register" className={s.btnGhostLg}>Create account</Link>
              </div>
            </div>

            {/* Step 2: eyebrow + h1 + description */}
            <div className={`${s.step} ${step === 2 ? s.stepVisible : s.stepHidden}`}>
              <p className={s.eyebrow}>Browser · JavaScript · Python · Java</p>
              <h1 className={s.heroTitle}>
                Write, run, save.{' '}
                <span className={s.accent}>// nothing else.</span>
              </h1>
              <p className={s.heroDesc}>
                A minimal online editor for quick scripts and study sessions.
                Open the tab, hit run, move on with your day.
              </p>
            </div>

            {/* Step 1: features */}
            <div className={`${s.step} ${step === 1 ? s.stepVisible : s.stepHidden}`}>
              <div className={s.featuresGrid}>
                <div className={s.featureItem}>
                  <span className={s.featureTag}>01 · EDIT</span>
                  <h4 className={s.featureTitle}>Monaco-powered editor</h4>
                  <p className={s.featureDesc}>The same engine that ships in VS Code. Syntax highlighting, autocomplete, and keyboard shortcuts out of the box.</p>
                </div>
                <div className={s.featureItem}>
                  <span className={s.featureTag}>02 · RUN</span>
                  <h4 className={s.featureTitle}>Instant execution</h4>
                  <p className={s.featureDesc}>Send your code to a sandboxed runtime and see stdout, stderr, and timing in one pane. No local setup required.</p>
                </div>
                <div className={s.featureItem}>
                  <span className={s.featureTag}>03 · SAVE</span>
                  <h4 className={s.featureTitle}>Pick up where you left off</h4>
                  <p className={s.featureDesc}>Save snippets to your account and reopen them by URL. Press Ctrl S to commit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
