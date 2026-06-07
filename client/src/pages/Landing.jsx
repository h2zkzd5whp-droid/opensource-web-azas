import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import s from '../styles/Landing.module.css';
import landingGif from '../assets/landingPage.gif';
import { apiRequest } from '../utils/api';
import LanguageMarquee from '../components/LanguageMarquee';
import HyperTerminal from '../components/HyperTerminal';
import FloatingCommands from '../components/FloatingCommands';

const SLIDE_COUNT = 4;


export default function Landing() {
  const pageRef = useRef(null);
  const heroWrapRef = useRef(null);
  const [step, setStep] = useState(0);
  const [members, setMembers] = useState([]);

  // Fetch team members on mount
  useEffect(() => {
    apiRequest('/team')
      .then((data) => setMembers(data?.members ?? []))
      .catch(() => setMembers([]));
  }, []);

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
            <Navbar />
          </div>
          <div className={s.heroContent}>

            {/* Slide 1: Welcome & CTA (Split Layout) */}
            <div className={`${s.step1} ${s.stepWide1} ${step === 0 ? s.stepVisible : s.stepHidden}`}>
              <div className={s.leftCol}>
                <p className={s.eyebrow}></p>
                <h1 className={s.heroTitle}>
                  AZAS Editor.<br />
                  <span className={s.gradientText}>// Code with joy, intelligent feedback.</span>
                </h1>
                <p className={s.heroDescLeft}>
                  The online compiler that makes coding fun. Write interactive code,<br/>
                  get real-time AI insights, and level up your skills — all in your browser.
                </p>
                <div className={s.ctaActionsLeft}>
                  <Button as={Link} to="/code" size="md">Open editor →</Button>
                  <Button as={Link} to="/register" size="md">Create account</Button>
                </div>
                <LanguageMarquee className={s.a}/> 
              </div>
              <div className={s.rightColFull}>
                <img src={landingGif} alt="Preview GIF" className={s.gifImageFull} />
              </div>
            </div>
  
            <div className={`${s.terminalContainer} ${step === 0 ? s.stepVisible : s.stepHidden}`}>
                  <HyperTerminal />
            </div>
            <div className={`${s.terminalContainer1} ${step === 0 ? s.stepVisible : s.stepHidden}`}>
                  <HyperTerminal style={{ width: '400px', height: '200px' }}/>
            </div>
            <div className={`${s.commandsContainer} ${step === 0 ? s.stepVisible : s.stepHidden}`}>
                <FloatingCommands />
            </div>

            {/* Slide 2: Feature Mockup (Split Layout) */}
            <div className={`${s.step} ${s.stepWide} ${step === 1 ? s.stepVisible : s.stepHidden}`}>
              <div className={s.leftColCentered}>
                <div className={s.vectorEditor}>
                  <div className={s.vectorHeader}>
                    <div className={s.vectorTab}>main.c</div>
                  </div>
                  <div className={s.vectorBody}>
                    <div className={s.vectorGutter}>
                      {Array.from({ length: 16 }, (_, i) => (
                        <span key={i + 1}>{i + 1}</span>
                      ))}
                    </div>
                    <pre className={s.vectorCode}>
                      <code>
                        <span className={s.keyword}>#include</span> <span className={s.string}>&lt;stdio.h&gt;</span><br />
                        <br />
                        <span className={s.keyword}>int</span> main() &#123;<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;printf(<span className={s.string}>"[Online Compiler]\n"</span>);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;printf(<span className={s.string}>"An online compiler is a\n"</span>);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;printf(<span className={s.string}>"web-based tool that allows\n"</span>);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;printf(<span className={s.string}>"you to write, compile, and\n"</span>);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;printf(<span className={s.string}>"run source code.\n"</span>);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;printf(<span className={s.string}>"It eliminates the need for\n"</span>);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;printf(<span className={s.string}>"local environment setup,\n"</span>);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;printf(<span className={s.string}>"enabling quick testing\n"</span>);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;printf(<span className={s.string}>"across various languages.\n"</span>);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className={s.keyword}>return</span> <span className={s.number || ''}>0</span>;<br />
                        &#125;
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
              <div className={s.rightColPlaceholders}>
                {[
                  {
                    tag: "01 · Style Reviewer AI",
                    title: "Intelligent Code Review",
                    desc: "Evaluates your code quality line by line, detecting readability bottlenecks, anti-patterns, and convention violations in real time to suggest cleaner alternatives."
                  },
                  {
                    tag: "02 · Performance Optimizer AI",
                    title: "Algorithmic Optimization",
                    desc: "Eliminates redundant calculations and runtime overhead, refactoring logic with live time/space complexity analysis ($O(N)$) for peak computational efficiency."
                  },
                  {
                    tag: "03 · Debugging Expert AI",
                    title: "Zero-Error Debugging",
                    desc: "Instantly tracks down the root causes of compilation and runtime errors, providing ready-to-apply code corrections along with indexed, beginner-friendly explanations."
                  },
                  {
                    tag: "04 · Core Environment",
                    title: "Lightweight Online Compiler",
                    desc: "Compile and execute your source code instantly inside your browser with a lightweight engine—completely independent of local tools or complex Docker environments."
                  }
                ].map((feature, idx) => (
                  <div key={idx} className={s.placeholderItem}>
                    <span className={s.featureTag}>{feature.tag}</span>
                    <h4 className={s.placeholderTitleText}>{feature.title}</h4>
                    <p className={s.placeholderDesc}>{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Slide 3: Compiler Features (3 Cards) */}
            <div className={`${s.step} ${step === 2 ? s.stepVisible : s.stepHidden}`}>
              <h2 className={s.sectionHeading}>Project Goals & Architecture</h2>
              <div className={s.compilerCards}>
                <div className={s.card}>
                  <h4 className={s.cardTitle}>Beyond Static Compilation</h4>
                  <p className={s.cardDesc}>
                    We aim to transform the traditionally stagnant online compiler into a dynamic, interactive playground, injecting life and responsiveness into the coding experience.
                  </p>
                </div>
                
                <div className={s.card}>
                  <h4 className={s.cardTitle}>On-Demand AI Insights</h4>
                  <p className={s.cardDesc}>
                    Rather than a passive background feature, AI is integrated into the core execution loop. Users can trigger intelligent code analysis and debugging insights on-demand, whenever they need clarity.
                  </p>
                </div>
              </div>
              <div className={s.techStackContainer}>
                <p className={s.techStackTitle}>SYSTEM ARCHITECTURE</p>
                <div className={s.techStackGrid}>
                  <div>
                    <span className={s.stackCategory}>Frontend</span>
                    <span className={s.stackValue}>React 19, Vite 8, Monaco</span>
                  </div>
                  <div>
                    <span className={s.stackCategory}>Backend</span>
                    <span className={s.stackValue}>Node.js 22, Express 4, MySQL 8</span>
                  </div>
                  <div>
                    <span className={s.stackCategory}>Infrastructure</span>
                    <span className={s.stackValue}>JWT, Axios, Isolated Sandbox</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 4: Contributors (from DB) */}
            <div className={`${s.step} ${step === 3 ? s.stepVisible : s.stepHidden}`}>
              <p className={s.eyebrow}>Our Team</p>
              <h2 className={s.sectionHeading}>Contributors</h2>
              <div className={s.contributorsGrid}>
                {(() => {
                  const images = import.meta.glob('../assets/team/*.{png,jpg,jpeg,svg}', { eager: true });
                  const MEMBER_DETAILS = {
                    'KimHyunSik': 'Orchestrated core API design, database schema architectures, and secure user information infrastructure pipelines.',
                    'NamYooSeong': 'Optimized server-side business logic and implemented highly resilient data communication architectures.',
                    'JeonSeongHyun': 'Engineered high-fidelity UI/UX interactions, typography gradient details, and fully responsive layouts.',
                    'Khulan Gurdor': ' Spearheaded component modularization, asynchronous state definitions, and interactive UX optimizations.'
                  };

                  return members.map((member) => {
                    const imageName = member.imgKey;
                    const matchedImage = images[`../assets/team/${imageName}`];
                    const imageUrl = matchedImage ? matchedImage.default : null;
                    return (
                      <a 
                        key={member.memberId} 
                        href={member.githubUrl || "https://github.com"}
                        target="_blank"                                 
                        rel="noopener noreferrer"                      
                        className={s.contributorCard}                  
                      >
                        <div className={s.avatar}>
                          <img
                            src={imageUrl}
                            alt={`${member.name} 프로필`}
                            className={s.avatarImage}
                          />
                        </div>
                        <h4 className={s.contributorName}>{member.name}</h4>
                        <p className={s.contributorRole}>{member.role}</p>
                        <p className={s.contributorDesc} style={{ fontSize: '11px', color: '#a855f7', marginBottom: '8px', fontFamily: 'var(--mono)' }}>{member.email}</p>
                        <p style={{ fontSize: '12px', opacity: 0.7, lineHeight: '1.45', marginTop: 'auto', textAlign: 'center' }}>
                            {MEMBER_DETAILS[member.name] || 'Core Contributor of AZAS Editor'}
                        </p>
                      </a>
                    );
                  });
                })()}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div >
  );
}

