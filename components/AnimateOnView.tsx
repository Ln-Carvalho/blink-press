'use client';
import { useEffect, useRef } from 'react';

export type RevealVariant = 'rise' | 'blur-rise' | 'clip-line' | 'draw' | 'fade';

interface Props {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}

export default function AnimateOnView({ children, variant = 'rise', delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-variant={variant}
      className={`animate-on-view${className ? ` ${className}` : ''}`}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
