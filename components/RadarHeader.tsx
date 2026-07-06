'use client';

import { createContext, useContext, useEffect, useState, type ReactNode, type ComponentProps } from 'react';
import AnimateOnView from '@/components/AnimateOnView';
import TextType from '@/components/TextType';
import SplitText from '@/components/SplitText';

const HeaderDoneContext = createContext(false);

export function useHeaderDone() {
  return useContext(HeaderDoneContext);
}

/** SplitText que só começa depois que o TextType do cabeçalho terminar. */
export function GatedSplitText(props: ComponentProps<typeof SplitText>) {
  const headerDone = useHeaderDone();
  return <SplitText {...props} ready={(props.ready ?? true) && headerDone} />;
}

interface RadarHeaderProps {
  /** Conteúdo do destaque (matéria mais recente) — fica dentro da primeira tela. */
  hero: ReactNode;
  /** Restante da página — fica abaixo da primeira tela. */
  children: ReactNode;
  /** Id do elemento pra onde a seta de scroll leva. */
  moreId: string;
}

export default function RadarHeader({ hero, children, moreId }: RadarHeaderProps) {
  const [headerDone, setHeaderDone] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <HeaderDoneContext.Provider value={headerDone}>
      <div className="flex min-h-[calc(100svh-10rem)] flex-col">
        <div className="flex flex-1 flex-col justify-center">
          <AnimateOnView>
            <header>
              {/* Texto real sempre no DOM para SEO/crawlers — a animação abaixo é só decorativa (aria-hidden). */}
              <div className="sr-only">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Blink Group Radar</p>
                <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                  Notícias que importam para sua PME
                </h1>
              </div>
              <div aria-hidden="true">
                <TextType
                  text={['Blink Group Radar', 'Notícias que importam para sua PME']}
                  segmentTags={['p', 'p']}
                  segmentClassNames={[
                    'font-mono text-xs uppercase tracking-[0.2em] text-orange',
                    'mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl',
                  ]}
                  onComplete={() => setHeaderDone(true)}
                />
              </div>
            </header>
          </AnimateOnView>
          <div className="brand-gradient divider-draw mt-3 mb-6 h-[2px] w-full sm:mb-10" />
          {hero}
        </div>

        <button
          type="button"
          onClick={() => document.getElementById(moreId)?.scrollIntoView({ behavior: 'smooth' })}
          aria-hidden={scrolled}
          tabIndex={scrolled ? -1 : 0}
          className={`animate-bounce mx-auto mb-3 mt-6 flex shrink-0 flex-col items-center gap-1 rounded-full border border-line px-4 py-2 text-orange transition-all duration-300 hover:border-orange ${
            scrolled ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <span className="font-mono text-xs uppercase tracking-wide">Ler mais artigos</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {children}
    </HeaderDoneContext.Provider>
  );
}
