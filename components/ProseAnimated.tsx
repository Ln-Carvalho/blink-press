'use client';
import { useEffect, useRef } from 'react';

export default function ProseAnimated({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const elements = container.querySelectorAll('p, h2, h3, li');
    const observers: IntersectionObserver[] = [];
    elements.forEach((el) => {
      el.classList.add('prose-child-hidden');
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -20px 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return <div ref={ref}>{children}</div>;
}
