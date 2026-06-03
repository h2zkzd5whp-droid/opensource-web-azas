import { useEffect } from 'react';

// Call `handler` when Escape is pressed, while `active` is true.
export default function useEscapeKey(active, handler) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === 'Escape') handler?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, handler]);
}
