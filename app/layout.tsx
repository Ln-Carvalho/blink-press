import type { Metadata } from 'next';
import { Newsreader, Libre_Franklin } from 'next/font/google';
import './globals.css';

const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-newsreader', style: ['normal', 'italic'] });
const libre = Libre_Franklin({ subsets: ['latin'], variable: '--font-libre' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blinkgroup.com.br'),
  title: { default: 'Blink Radar', template: '%s — Blink' },
  description: 'O que PMEs brasileiras precisam saber para crescer. Notícias com análise e pesquisa aplicada, pela Blink.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${newsreader.variable} ${libre.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
