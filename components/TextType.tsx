'use client';

import { useEffect, useRef, useState, createElement } from 'react';
import { gsap } from 'gsap';
import './TextType.css';

interface TextTypeProps {
  text: string[];
  segmentTags?: string[];
  segmentClassNames?: string[];
  typingSpeed?: number;
  initialDelay?: number;
  pauseBetweenSegments?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  className?: string;
  startOnVisible?: boolean;
  onComplete?: () => void;
}

const TextType = ({
  text,
  segmentTags = [],
  segmentClassNames = [],
  typingSpeed = 40,
  initialDelay = 0,
  pauseBetweenSegments = 120,
  showCursor = true,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  className = '',
  startOnVisible = true,
  onComplete,
}: TextTypeProps) => {
  const [completedSegments, setCompletedSegments] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedCurrent, setDisplayedCurrent] = useState('');
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  const completeFiredRef = useRef(false);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (showCursor && cursorRef.current) {
      gsap.set(cursorRef.current, { opacity: 1 });
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });
    }
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (!isVisible || currentIndex >= text.length) return;
    const target = text[currentIndex];

    if (charIndex < target.length) {
      const delay = currentIndex === 0 && charIndex === 0 ? initialDelay : typingSpeed;
      const t = setTimeout(() => {
        setDisplayedCurrent((prev) => prev + target[charIndex]);
        setCharIndex((i) => i + 1);
      }, delay);
      return () => clearTimeout(t);
    }

    if (currentIndex < text.length - 1) {
      const t = setTimeout(() => {
        setCompletedSegments((prev) => [...prev, target]);
        setCurrentIndex((i) => i + 1);
        setCharIndex(0);
        setDisplayedCurrent('');
      }, pauseBetweenSegments);
      return () => clearTimeout(t);
    }
  }, [isVisible, currentIndex, charIndex, text, typingSpeed, initialDelay, pauseBetweenSegments]);

  const renderSegment = (content: string, index: number, cursor: React.ReactNode) => {
    const Tag = (segmentTags[index] ?? 'div') as keyof React.JSX.IntrinsicElements;
    return createElement(Tag, { key: index, className: segmentClassNames[index] ?? '' }, content, cursor);
  };

  const finishedTyping = currentIndex === text.length - 1 && charIndex >= (text[text.length - 1]?.length ?? 0);

  useEffect(() => {
    if (finishedTyping && !completeFiredRef.current) {
      completeFiredRef.current = true;
      onCompleteRef.current?.();
    }
  }, [finishedTyping]);

  const cursorEl =
    showCursor && !finishedTyping ? (
      <span ref={cursorRef} className={`text-type__cursor ${cursorClassName}`}>
        {cursorCharacter}
      </span>
    ) : null;

  return (
    <div ref={containerRef} className={`text-type ${className}`}>
      {completedSegments.map((seg, i) => renderSegment(seg, i, null))}
      {currentIndex < text.length && renderSegment(displayedCurrent, currentIndex, cursorEl)}
    </div>
  );
};

export default TextType;
