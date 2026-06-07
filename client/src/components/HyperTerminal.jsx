import { useState, useEffect } from 'react';
import s from '../styles/HyperTerminal.module.css'; // 경로에 맞게 수정해주세요.

const HYPER_COMMANDS = [
  "hyper i hyper-snazzy\n✔ Downloading hyper-snazzy\n✔ Plugin installed successfully! ",
  "npm init azas-app\nCreating a new cloud workspace...\nReady in 0.4s! ",
  "azas --version\nazas-compiler v1.0.0 (Production Build)",
  "git clone https://github.com/azas/core.git\nCloning into 'core'...\nremote: Enumerating objects: 104, done.\n✔ Fetch completed. ",
  "azas run main.azas\n[Compiling] cf-grammar v1.0...\n[Success] Output: Hello, AZAS Cloud Engine! ",
  "docker-compose up -d --build\nBuilding azas-compiler...\n✔ Container azas-backend-1 Started ",
  "npm run test\nPASS  src/tests/parser.test.js\nTest Suites: 1 passed, 1 total\nSnapshots:   0 total\nTime:        0.85s ",
  "pip install azas-ai-agent\nCollecting azas-ai-agent...\nSuccessfully installed azas-ai-agent-2.4.1 "
];

export default function HyperTerminal({ style }) {
  const [text, setText] = useState('');
  
  // 🌟 2. 시작할 때도 첫 문장이 아닌 랜덤한 문장으로 시작하도록 초기화
  const [index, setIndex] = useState(() => Math.floor(Math.random() * HYPER_COMMANDS.length));
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(60);

  useEffect(() => {
    const currentFullText = HYPER_COMMANDS[index];

    const handleTyping = () => {
      if (!isDeleting) {
        setText(currentFullText.substring(0, text.length + 1));
        
        // 타이핑 중: 40ms ~ 90ms 사이 랜덤
        const randomTypingSpeed = 40 + Math.floor(Math.random() * 50);
        setSpeed(randomTypingSpeed); 

        if (text === currentFullText) {
          setSpeed(2500); // 문장 완성 시 대기 시간 (2.5초)
          setIsDeleting(true);
        }
      } else {
        setText(currentFullText.substring(0, text.length - 1));
        
        // 지우는 중: 10ms ~ 30ms 사이 랜덤
        const randomDeleteSpeed = 10 + Math.floor(Math.random() * 20);
        setSpeed(randomDeleteSpeed); 

        if (text === '') {
          setIsDeleting(false);
          
          // 🌟 3. 완전히 지워진 후, 순서대로가 아니라 '중복되지 않는 다른 랜덤 문구' 선택하기
          setIndex((prevIndex) => {
            let nextIndex = Math.floor(Math.random() * HYPER_COMMANDS.length);
            // 만약 새로 뽑은 인덱스가 직전 인덱스와 똑같다면, 다를 때까지 계속 다시 뽑기 (안전장치)
            while (nextIndex === prevIndex) {
              nextIndex = Math.floor(Math.random() * HYPER_COMMANDS.length);
            }
            return nextIndex;
          });
          
          // 다음 문구 시작 전 대기: 200ms ~ 800ms 사이 랜덤
          const randomWaitSpeed = 200 + Math.floor(Math.random() * 600);
          setSpeed(randomWaitSpeed); 
        }
      }
    };

    const timer = setTimeout(handleTyping, speed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, index, speed]);

  return (
    <div className={s.hyperWindow} style={style}>
      {/* Hyper 헤더: 탭 형태 없이 미니멀한 디자인 */}
      <div className={s.hyperHeader}>
        <div className={s.trafficLights}>
          <span className={`${s.dot} ${s.red}`}></span>
          <span className={`${s.dot} ${s.yellow}`}></span>
          <span className={`${s.dot} ${s.green}`}></span>
        </div>
        <div className={s.windowTitle}>~</div>
      </div>
      
      {/* Hyper 바디: 퓨어 블랙과 세련된 패딩 */}
      <div className={s.hyperBody}>
        <pre className={s.terminalContent}>
          <span className={s.prompt}>▲ </span>
          {text}
          <span className={s.cursor}></span>
        </pre>
      </div>
    </div>
  );
}