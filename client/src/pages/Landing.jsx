import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import slide0Bg from '../assets/landing_image.png';
import slide1Bg from '../assets/landing_slide_1.png';
import slide2Bg from '../assets/landing_slide_2.png';
import slide3Bg from '../assets/landing_slide_3.png';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import s from '../styles/Landing.module.css';

const SLIDES = [
  { id: 'cta', bg: slide0Bg },
  { id: 'features', bg: slide1Bg },
  { id: 'tagline', bg: slide2Bg },
  { id: 'slide4', bg: slide3Bg },
];

const SLIDE_COUNT = SLIDES.length;

export default function Landing() {
  const pageRef = useRef(null);
  const heroWrapRef = useRef(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    let ticking = false;

    function update() {
      const wrap = heroWrapRef.current;
      if (!wrap) {
        ticking = false;
        return;
      }
      const { top, height } = wrap.getBoundingClientRect();
      const scrolled = -top;
      const sectionH = height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / sectionH));

      if (progress < 1 / SLIDE_COUNT) setStep(0);
      else if (progress < 2 / SLIDE_COUNT) setStep(1);
      else if (progress < 3 / SLIDE_COUNT) setStep(2);
      else setStep(3);

      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll, { passive: true });
  }, []);

  return (
    <div className={s.page} ref={pageRef}>
      {/* ===== Sticky hero section ===== */}
      <div className={s.heroWrap} ref={heroWrapRef}>
        <div className={s.heroSticky}>
          {SLIDES.map((slide, i) => (
            <div
              key={slide.id}
              className={`${s.heroBg} ${step === i ? s.heroBgVisible : s.heroBgHidden}`}
              style={{ '--hero-img': `url(${slide.bg})` }}
            />
          ))}
          <div className={s.heroOverlay} />

          {/* Nav */}
          <div className={s.nav}>
            <Navbar transparent />
          </div>

          {/* Hero content — steps */}
          <div className={s.heroContent}>
            {/* Step 0: CTA */}
            <div className={`${s.step} ${step === 0 ? s.stepVisible : s.stepHidden}`}>
              <p className={s.eyebrow}>Ready to start?</p>
              <h1 className={s.heroTitle}>Open the editor.<br /><span className={s.accent}>// no setup required.</span></h1>
              <div className={s.ctaActions}>
                <Button as={Link} to="/code" variant="primary" size="md">Open editor →</Button>
                <Button as={Link} to="/register" variant="ghost" size="md">Create account</Button>
              </div>
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

            {/* Step 3: placeholder */}
            <div className={`${s.step} ${step === 3 ? s.stepVisible : s.stepHidden}`}>
              <p className={s.eyebrow}>Slide 4</p>
              <h1 className={s.heroTitle}>Placeholder title</h1>
              <p className={s.heroDesc}>Add your HTML content here.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
