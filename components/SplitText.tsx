'use client';

import { useRef, useEffect, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: CSSProperties['textAlign'];
  tag?: HeadingTag;
  onLetterAnimationComplete?: () => void;
  ready?: boolean;
}

interface SplitTextTarget extends HTMLElement {
  _rbsplitInstance?: { revert: () => void } | null;
}

const SplitText = ({
  text,
  className = '',
  delay = 12,
  duration = 0.015,
  ease = 'power2.out',
  splitType = 'chars',
  from = { opacity: 0, y: 10 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete,
  ready = true,
}: SplitTextProps) => {
  const ref = useRef<SplitTextTarget>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  // Só divide o texto em caracteres quando o elemento está perto da tela —
  // evita que dezenas de instâncias façam o split (custoso, força reflow)
  // simultaneamente no carregamento de páginas com muitos títulos.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded || !isNear || !ready) return;
      if (animationCompletedRef.current) return;
      const el = ref.current;

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch {
          /* noop */
        }
        el._rbsplitInstance = null;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      let targets: Element[] | undefined;
      const assignTargets = (self: { chars: Element[]; words: Element[]; lines: Element[] }) => {
        if (splitType.includes('chars') && self.chars.length) targets = self.chars;
        if (!targets && splitType.includes('words') && self.words.length) targets = self.words;
        if (!targets && splitType.includes('lines') && self.lines.length) targets = self.lines;
        if (!targets) targets = self.chars || self.words || self.lines;
      };

      el.classList.add('split-ready');

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self) => {
          assignTargets(self);
          return gsap.fromTo(
            targets!,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4,
              },
              onComplete: () => {
                gsap.set(targets!, { willChange: 'auto' });
                animationCompletedRef.current = true;
                onCompleteRef.current?.();
              },
              willChange: 'transform, opacity',
              force3D: true,
            },
          );
        },
      });

      el._rbsplitInstance = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill();
        });
        try {
          splitInstance.revert();
        } catch {
          /* noop */
        }
        el._rbsplitInstance = null;
        el.classList.remove('split-ready');
      };
    },
    {
      dependencies: [text, delay, duration, ease, splitType, JSON.stringify(from), JSON.stringify(to), threshold, rootMargin, fontsLoaded, isNear, ready],
      scope: ref,
    },
  );

  const style: CSSProperties = {
    textAlign,
    overflow: 'hidden',
    display: tag === 'span' ? 'inline' : 'inline-block',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    willChange: 'transform, opacity',
  };
  const Tag = tag as 'p';

  return (
    <Tag ref={ref as React.Ref<HTMLParagraphElement>} style={style} className={`split-parent ${className}`}>
      {text}
    </Tag>
  );
};

export default SplitText;
