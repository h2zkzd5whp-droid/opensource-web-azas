import { useEffect } from 'react';

// user 설정의 theme(dark·light)을 documentElement에 data-theme으로 반영
export default function ThemeApplier({ theme }) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || theme === 'light') {
      root.setAttribute('data-theme', theme);
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  return null;
}
