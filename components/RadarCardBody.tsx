'use client';

import { useState } from 'react';
import Link from 'next/link';
import SplitText from '@/components/SplitText';
import { useHeaderDone } from '@/components/RadarHeader';

interface RadarCardBodyProps {
  title: string;
  summary: string;
  featured?: boolean;
  titleHref?: string;
}

export default function RadarCardBody({ title, summary, featured = false, titleHref }: RadarCardBodyProps) {
  const headerDone = useHeaderDone();
  const [titleDone, setTitleDone] = useState(false);

  const titleNode = (
    <SplitText
      tag="span"
      text={title}
      className="link-gradient"
      textAlign={featured ? 'center' : 'left'}
      ready={headerDone}
      onLetterAnimationComplete={() => setTitleDone(true)}
    />
  );

  return (
    <>
      <h2
        className={
          featured
            ? 'mt-4 font-display font-semibold leading-tight text-[clamp(1.75rem,5vw,2.5rem)] text-center'
            : 'mt-3 font-display text-2xl font-semibold leading-snug'
        }
      >
        {titleHref ? <Link href={titleHref}>{titleNode}</Link> : titleNode}
      </h2>
      {featured ? (
        <p className="mt-4 text-center text-lg leading-relaxed text-ink">
          <span className="font-semibold brand-gradient-text">Por que importa:</span>{' '}
          <SplitText tag="span" text={summary} splitType="words" textAlign="center" ready={titleDone} />
        </p>
      ) : (
        <SplitText
          tag="p"
          text={summary}
          className="mt-2 text-muted text-justified"
          splitType="words"
          textAlign="justify"
          ready={titleDone}
        />
      )}
    </>
  );
}
