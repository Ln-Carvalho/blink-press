import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/brand/LogoBlink_Preta.png';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-5 h-16 flex items-center justify-between gap-4">
          <a href="https://blinkgroup.com.br" className="flex items-center" aria-label="Blink — blinkgroup.com.br">
            <Image src={logo} alt="Blink" priority className="h-6 w-auto" />
          </a>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/radar" className="text-ink hover:text-orange transition-colors">Radar</Link>
            <Link href="/research" className="text-ink hover:text-orange transition-colors">Research</Link>
            <a href="https://blinkgroup.com.br" className="text-muted hover:text-ink transition-colors">← blinkgroup.com.br</a>
          </nav>
        </div>
        <div className="h-0.5 w-full brand-gradient" />
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">{children}</main>

      <footer className="border-t border-line mt-8">
        <div className="mx-auto max-w-3xl px-5 py-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Image src={logo} alt="Blink" className="h-5 w-auto" />
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Blink Group ·{' '}
            <a href="https://blinkgroup.com.br" className="hover:text-orange transition-colors underline underline-offset-2">
              blinkgroup.com.br
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
