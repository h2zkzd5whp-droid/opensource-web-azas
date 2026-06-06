import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import s from '../styles/Landing.module.css';
import landingGif from '../assets/landingPage.gif';

const SLIDE_COUNT = 4;


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

          {/* Nav */}
          <div className={s.nav}>
            <Navbar transparent />
          </div>

          {/* Hero content — steps */}
          <div className={s.heroContent}>

            {/* Slide 1: Welcome & CTA (Split Layout) */}
            <div className={`${s.step} ${s.stepWide} ${step === 0 ? s.stepVisible : s.stepHidden}`}>
              <div className={s.leftCol}>
                <p className={s.eyebrow}></p>
                <h1 className={s.heroTitle}>
                  Open the editor.<br />
                  <span className={s.accent}>// no setup required.</span>
                </h1>
                <p className={s.heroDescLeft}>
                  A powerful, web-based multi-language editor & online compiler.
                  Write, run, and share your snippets directly from your browser with ease.
                </p>
                <div className={s.ctaActionsLeft}>
                  <Button as={Link} to="/code" variant="primary" size="md">Open editor →</Button>
                  <Button as={Link} to="/register" variant="ghost" size="md">Create account</Button>
                </div>
              </div>
              <div className={s.rightColFull}>
                <img src={landingGif} alt="Preview GIF" className={s.gifImageFull} />
              </div>
            </div>

            {/* Slide 2: Feature Mockup (Split Layout) */}
            <div className={`${s.step} ${s.stepWide} ${step === 1 ? s.stepVisible : s.stepHidden}`}>
              <div className={s.leftColCentered}>
                <div className={s.vectorEditor}>
                  <div className={s.vectorHeader}>
                    <div className={s.vectorTab}>index.js</div>
                  </div>
                  <div className={s.vectorBody}>
                    <div className={s.vectorGutter}>
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                    </div>
                    <pre className={s.vectorCode}>
                      <code>
                        <span className={s.keyword}>import</span> &#123; exec &#125; <span className={s.keyword}>from</span> <span className={s.string}>'compiler'</span>;<br />
                        <br />
                        <span className={s.keyword}>const</span> res = <span className={s.keyword}>await</span> exec(<span className={s.string}>'js'</span>);<br />
                        console.log(res.status);
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
              <div className={s.rightColPlaceholders}>
                <div className={s.placeholderItem}>
                  <span className={s.featureTag}>01 · EDIT</span>
                  <h4 className={s.placeholderTitleText}>Monaco Editor</h4>
                  <p className={s.placeholderDesc}>Rich editing experience with autocomplete & syntax highlighting.</p>
                </div>
                <div className={s.placeholderItem}>
                  <span className={s.featureTag}>02 · RUN</span>
                  <h4 className={s.placeholderTitleText}>Instant Execution</h4>
                  <p className={s.placeholderDesc}>Execute in a sandboxed runtime environment and see real-time output.</p>
                </div>
                <div className={s.placeholderItem}>
                  <span className={s.featureTag}>03 · SAVE</span>
                  <h4 className={s.placeholderTitleText}>Sync & Share</h4>
                  <p className={s.placeholderDesc}>Save snippets to your account and access them from anywhere.</p>
                </div>
              </div>
            </div>

            {/* Slide 3: Compiler Features (3 Cards) */}
            <div className={`${s.step} ${step === 2 ? s.stepVisible : s.stepHidden}`}>
              <p className={s.eyebrow}>Write, run, save.</p>
              <h2 className={s.sectionHeading}>Compiler Features</h2>
              <div className={s.compilerCards}>
                <div className={s.card}>
                  <div className={s.cardIcon}>⚡</div>
                  <h4 className={s.cardTitle}>Super Fast Execution</h4>
                  <p className={s.cardDesc}>Powered by high-performance compilation containers for immediate stdout/stderr feedback.</p>
                </div>
                <div className={s.card}>
                  <div className={s.cardIcon}>🔒</div>
                  <h4 className={s.cardTitle}>Safe Sandboxing</h4>
                  <p className={s.cardDesc}>Your code is securely isolated and run in a protected container environment.</p>
                </div>
                <div className={s.card}>
                  <div className={s.cardIcon}>🌐</div>
                  <h4 className={s.cardTitle}>Multi-Language Support</h4>
                  <p className={s.cardDesc}>Write in JavaScript, Python, Java, and more with dedicated language environments.</p>
                </div>
              </div>
            </div>

            {/* Slide 4: Contributors */}
            <div className={`${s.step} ${step === 3 ? s.stepVisible : s.stepHidden}`}>
              <p className={s.eyebrow}>Our Team</p>
              <h2 className={s.sectionHeading}>Contributors</h2>
              <div className={s.contributorsGrid}>
                <div className={s.contributorCard}>
                  <div className={s.avatar}>👨‍💻</div>
                  <h4 className={s.contributorName}>Lead Architect</h4>
                  <p className={s.contributorRole}>Core Compiler & Backend</p>
                  <p className={s.contributorDesc}>Designed sandboxed execution engines and API orchestrations.</p>
                </div>
                <div className={s.contributorCard}>
                  <div className={s.avatar}>🎨</div>
                  <h4 className={s.contributorName}>Frontend Specialist</h4>
                  <p className={s.contributorRole}>UI/UX Designer & Engineer</p>
                  <p className={s.contributorDesc}>Crafted beautiful and responsive components and dashboard layout.</p>
                </div>
                <div className={s.contributorCard}>
                  <div className={s.avatar}>🔍</div>
                  <h4 className={s.contributorName}>QA & Tester</h4>
                  <p className={s.contributorRole}>Reliability Engineer</p>
                  <p className={s.contributorDesc}>Maintained comprehensive integration test suites and security sandboxes.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

