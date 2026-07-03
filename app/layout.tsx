import type { Metadata } from 'next';
import { MuseoModerno, Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import DotField from '@/components/DotField';

const display = MuseoModerno({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-museo' });
const body = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blinkgroup.com.br'),
  title: { default: 'Blink Radar', template: '%s — Blink' },
  description: 'O que PMEs brasileiras precisam saber para crescer. Notícias com análise e pesquisa aplicada, pela Blink.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <DotField
          dotRadius={1.5}
          dotSpacing={16}
          bulgeStrength={50}
          glowRadius={160}
          cursorRadius={280}
          gradientFrom="#FFA52E"
          gradientTo="#F21A1A"
          glowColor="#F21A1A"
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}
        />
        {children}<Analytics /><SpeedInsights /></body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-TMRBQ00WBE"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-TMRBQ00WBE');
        `}
      </Script>
    </html>
  );
}
