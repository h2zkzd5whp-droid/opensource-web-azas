import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import s from '../styles/Landing.module.css';
import landingGif from '../assets/landingPage.gif';
import { apiRequest } from '../utils/api';
import LanguageMarquee from '../components/LanguageMarquee';

const SLIDE_COUNT = 4;

// Role별 아바타 이모지 매핑
const ROLE_AVATAR = {
  'AI Developer': '🤖',
  'Backend Developer': '⚙️',
  'LandingPage Developer': '🎨',
  'Dashboard Developer': '📊',
};

function getAvatar(role) {
  return ROLE_AVATAR[role] ?? '👨‍💻';
}


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
            <Navbar transparent />
          </div>

          {/* Hero content — steps */}
          <div className={s.heroContent}>

            {/* Slide 1: Welcome & CTA (Split Layout) */}
            <div className={`${s.step} ${s.stepWide} ${step === 0 ? s.stepVisible : s.stepHidden}`}>
              <div className={s.leftCol}>
                <p className={s.eyebrow}></p>
                <h1 className={s.heroTitle}>
                  AZAS Editor.<br />
                  <span className={s.accent}>// With AI, No setup.</span>
                </h1>
                <p className={s.heroDescLeft}>
                  A powerful, web-based multi-language editor & online compiler.
                  Write, run, and share your snippets directly from your browser with ease.
                </p>
                <div className={s.ctaActionsLeft}>
                  <Button as={Link} to="/code" variant="primary" size="md">Open editor →</Button>
                  <Button as={Link} to="/register" variant="ghost" size="md">Create account</Button>
                </div>
                <LanguageMarquee className={s.a}/> 
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
                    <div className={s.vectorTab}>main.c</div>
                  </div>
                  <div className={s.vectorBody}>
                    <div className={s.vectorGutter}>
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
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
                <div className={s.placeholderItem}>
                  <span className={s.featureTag}>01 · Style Reviewer AI</span>
                  <h4 className={s.placeholderTitleText}>Code Style Review</h4>
                  <p className={s.placeholderDesc}>
                    Detects readability issues, anti-patterns, and convention violations with line-by-line quality scores.
                  </p>
                </div>
                <div className={s.placeholderItem}>
                  <span className={s.featureTag}>02 · Performance Optimizer AI</span>
                  <h4 className={s.placeholderTitleText}>Algorithm Optimization</h4>
                  <p className={s.placeholderDesc}>
                    Eliminates redundant operations and refactors code with complexity analysis ($O(N)$) for peak efficiency.
                  </p>
                </div>
                <div className={s.placeholderItem}>
                  <span className={s.featureTag}>03 · Debugging Expert AI</span>
                  <h4 className={s.placeholderTitleText}>Error Debugging</h4>
                  <p className={s.placeholderDesc}>
                    Pinpoints root causes of compilation/runtime errors, providing corrected code and indexed explanations.
                  </p>
                </div>
              </div>
            </div>

            {/* Slide 3: Compiler Features (3 Cards) */}
            <div className={`${s.step} ${step === 2 ? s.stepVisible : s.stepHidden}`}>
              <p className={s.eyebrow}>Write, run, save.</p>
              <h2 className={s.sectionHeading}>Compiler Features</h2>
              <div className={s.compilerCards}>
                <div className={s.card}>
                  <div className={s.cardIcon}>✨</div>
                  <h4 className={s.cardTitle}>Code Style Review</h4>
                  <p className={s.cardDesc}>
                    Detects readability issues, anti-patterns, and convention violations with precise line-by-line.
                  </p>
                </div>
                <div className={s.card}>
                  <div className={s.cardIcon}>🏷️</div>
                  <h4 className={s.cardTitle}>Dynamic Error Notation</h4>
                  <p className={s.cardDesc}>
                    Pinpoints compilation or runtime root causes using indexed tags for intuitive visual tracking.
                  </p>
                </div>
                <div className={s.card}>
                  <div className={s.cardIcon}>🌐</div>
                  <h4 className={s.cardTitle}>Multi-Language Support</h4>
                  <p className={s.cardDesc}>Write in JavaScript, Python, Java, and more with dedicated language environments.</p>
                </div>
              </div>
            </div>

            {/* Slide 4: Contributors (from DB) */}
            <div className={`${s.step} ${step === 3 ? s.stepVisible : s.stepHidden}`}>
              <p className={s.eyebrow}>Our Team</p>
              <h2 className={s.sectionHeading}>Contributors</h2>
              <div className={s.contributorsGrid}>
                {members.map((member) => {
                  // 1. DB 데이터 구조에 맞게 명확히 imgKey 추출
                  const imageName = member.imgKey;
                  // 2. src/assets 폴더 내의 모든 이미지 자원을 미리 맵으로 빌드 (Vite 표준 기법)
                  const images = import.meta.glob('../assets/team/*.{png,jpg,jpeg,svg}', { eager: true });
                  // 3. 맵에서 해당 이미지 파일의 실제 서빙 URL을 안전하게 조회
                  const matchedImage = images[`../assets/team/${imageName}`];
                  const imageUrl = matchedImage ? matchedImage.default : null;
                  return (
                    <div key={member.memberId} className={s.contributorCard}>
                      <div className={s.avatar}>
                        {imageUrl ? (
                          <img
                            src={`${imageUrl}`}
                            alt={`${member.name} 프로필`}
                            className={s.avatarImage}
                            onError={(e) => {
                              console.error(`이미지 렌더링 실패: ${imageUrl}`);
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = getAvatar(member.role);
                            }}
                          />
                        ) : (
                          getAvatar(member.role)
                        )}
                      </div>
                      <h4 className={s.contributorName}>{member.name}</h4>
                      <p className={s.contributorRole}>{member.role}</p>
                      <p className={s.contributorDesc}>{member.email}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

