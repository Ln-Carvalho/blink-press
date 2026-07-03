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

export default function RadarHeader({ children }: { children: ReactNode }) {
  const [headerDone, setHeaderDone] = useState(false);

  return (
    <HeaderDoneContext.Provider value={headerDone}>
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
      {children}
    </HeaderDoneContext.Provider>
  );
}
