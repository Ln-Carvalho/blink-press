'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Radar',    href: '/radar'    },
  { label: 'Research', href: '/research' },
];

interface SiteHeaderProps {
  sectionLabel?: string;
}

export default function SiteHeader({ sectionLabel = 'RADAR' }: SiteHeaderProps) {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* ─── Pill header ─── */}
      <header
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 rounded-full transition-all duration-400 ease-in-out w-[90%] max-w-5xl bg-paper/80 backdrop-blur-md text-ink border border-orange/15 ${
          scrolled ? 'shadow-[0_8px_32px_rgba(0,0,0,0.10)]' : 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
        }`}
      >
        {/* Selo de seção */}
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase font-medium select-none text-muted">
          {sectionLabel}
        </span>

        {/* ─── Navegação desktop ─── */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative pb-0.5 transition-colors ${
                isActive(item.href) ? 'text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-0 w-full h-px brand-gradient" aria-hidden="true" />
              )}
            </Link>
          ))}

          <a
            href="https://blinkgroup.com.br"
            className="brand-gradient text-paper text-sm font-medium px-4 py-1.5 rounded-full ml-1 hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            ← Home
          </a>
        </nav>

        {/* ─── Hambúrguer mobile ─── */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileOpen}
          className="md:hidden p-2 -mr-2 text-ink"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h14M3 10h14M3 14h14" />
            </svg>
          )}
        </button>
      </header>

      {/* ─── Menu mobile (fora do pill, logo abaixo) ─── */}
      {mobileOpen && (
        <div className="fixed top-[4.5rem] left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-5xl md:hidden flex flex-col gap-3 px-6 py-5 bg-paper/95 backdrop-blur-md rounded-2xl border border-orange/15 shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-medium ${isActive(item.href) ? 'brand-gradient-text' : 'text-ink'}`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://blinkgroup.com.br"
            className="text-sm font-medium text-muted hover:text-ink transition-colors"
          >
            ← Home
          </a>
        </div>
      )}
    </>
  );
}
