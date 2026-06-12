import Link from 'next/link';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto max-w-3xl px-5 py-5 flex items-baseline justify-between">
          <Link href="/radar" className="font-display text-2xl font-semibold tracking-tight">
            Blink<span className="italic font-normal"> Radar</span>
          </Link>
          <nav className="flex gap-6 text-sm text-muted">
            <Link href="/radar" className="hover:text-ink">Radar</Link>
            <Link href="/research" className="hover:text-ink">Research</Link>
            <a href="https://blinkgroup.com.br" className="hover:text-ink">blinkgroup.com.br</a>
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-3xl px-5 py-10">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto max-w-3xl px-5 py-8 text-sm text-muted">
          © {new Date().getFullYear()} Blink Group — uma publicação para PMEs brasileiras.
        </div>
      </footer>
    </>
  );
}
