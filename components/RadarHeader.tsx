'use client';

import { createContext, useContext, useState, type ReactNode, type ComponentProps } from 'react';
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

  return (
    <HeaderDoneContext.Provider value={headerDone}>
      <div className="flex min-h-[calc(100svh-10rem)] flex-col">
        <div className="flex flex-1 flex-col justify-center text-center">
          <AnimateOnView>
            <header>
              <TextType
                text={['Blink Group Radar', 'Notícias que importam para sua PME']}
                segmentTags={['p', 'h1']}
                segmentClassNames={[
                  'font-mono text-xs uppercase tracking-[0.2em] text-orange',
                  'mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl',
                ]}
                onComplete={() => setHeaderDone(true)}
              />
            </header>
          </AnimateOnView>
          {hero}
        </div>

        <button
          type="button"
          onClick={() => document.getElementById(moreId)?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Ver mais notícias"
          className="animate-bounce mx-auto mb-6 mt-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-orange transition-colors hover:border-orange"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {children}
    </HeaderDoneContext.Provider>
  );
}
