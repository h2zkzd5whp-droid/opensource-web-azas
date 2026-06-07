import { useState, useEffect } from 'react';
import s from '../styles/FloatingCommands.module.css';

const COMMAND_POOL = [
  'print("Hello, AZAS!")',
  'console.log("Compile Success")',
  'fmt.Println("Go Cloud")',
  'println!("Rust Mode")',
  'git commit -m "feat: AI"',
  'npm run dev',
  'pip install azas',
  './build_core.sh'
];

export default function FloatingCommands() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomText = COMMAND_POOL[Math.floor(Math.random() * COMMAND_POOL.length)];
      const id = Date.now() + Math.random();
      const randomLeft = Math.random() * 75; // 좌측 정렬 가두리 범위 (0%~75%)
      const randomDuration = 3 + Math.random() * 2; // 3초 ~ 5초 사이 랜덤 속도

      const minSize = 11;
      const maxSize = 26;
      const randomSize = minSize + Math.floor(Math.random() * (maxSize - minSize + 1));
      const randomOpacity = 0.2 + (randomSize - 11) * 0.08;

      setItems((prev) => [
        ...prev,
        { 
          id, 
          text: randomText, 
          left: `${randomLeft}%`, 
          duration: `${randomDuration}s`,
          fontSize: `${randomSize}px`, // style 주입용
          baseOpacity: randomOpacity   // CSS 애니메이션에서 참조할 투명도 기준값
        }
      ]);

      // 만료된 데이터 청소
      setItems((prev) => prev.filter((item) => Date.now() - item.id < 5000));
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={s.floatingContainer}>
      {items.map((item) => (
        <span
          key={item.id}
          className={s.floatingItem}
          style={{ 
            left: item.left, 
            animationDuration: item.duration,
            fontSize: item.fontSize,
            '--custom-size': item.fontSize,
            '--base-opacity': item.baseOpacity
          }}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}