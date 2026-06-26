'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import logo from '@/public/brand/LogoBlink_Preta.png';

const NAV_ITEMS = [
  { label: 'Sobre',        href: 'https://blinkgroup.com.br/#sobre',        external: true  },
  { label: 'Como Atuamos', href: 'https://blinkgroup.com.br/#como-atuamos', external: true  },
  { label: 'Portfólio',    href: 'https://blinkgroup.com.br/#portfolio',    external: true  },
  { label: 'Fundadores',   href: 'https://blinkgroup.com.br/#fundadores',   external: true  },
  { label: 'Radar',        href: '/radar',                                  external: false },
  { label: 'Research',     href: '/research',                               external: false },
  { label: 'Contato',      href: 'https://blinkgroup.com.br/#contato',      external: true  },
];

export default function SiteHeader() {
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

  const isActive = (href: string) => !href.startsWith('http') && pathname.startsWith(href);

  return (
    <>
      {/* ─── Pill header ─── */}
      <nav
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 rounded-full transition-all duration-400 ease-in-out w-[90%] max-w-5xl bg-[#FDFAF4]/80 backdrop-blur-md text-ink border border-[#FF6A00]/15 ${
          scrolled ? 'shadow-[0_8px_32px_rgba(0,0,0,0.10)]' : 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
        }`}
        aria-label="Navegação principal"
        style={{ backdropFilter: 'blur(16px)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="https://blinkgroup.com.br">
            <Image
              src={logo}
              alt="Blink"
              className="w-auto transition-all duration-300 h-8 lg:h-10"
            />
          </Link>
        </div>

        {/* ─── Nav links desktop ─── */}
        <div className="hidden lg:flex items-center gap-8 font-medium text-sm">
          {NAV_ITEMS.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                className="relative hover:text-orange py-1 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`relative py-1 transition-colors ${
                  isActive(item.href) ? 'text-orange' : 'hover:text-orange'
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* ─── CTA desktop ─── */}
        <div className="hidden lg:block">
          <a
            href="https://wa.me/5521990230538?text=Oi%2C%20tenho%20interesse%20na%20Blink."
            target="_blank"
            rel="noreferrer"
            className="brand-gradient text-paper font-semibold text-sm px-6 py-2.5 rounded-full hover:scale-105 transition-transform inline-block relative overflow-hidden"
          >
            Fale Conosco
          </a>
        </div>

        {/* ─── Hambúrguer mobile ─── */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileOpen}
          className="lg:hidden p-2"
        >
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* ─── Menu mobile ─── */}
      {mobileOpen && (
        <div className="fixed top-[5rem] left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-5xl lg:hidden flex flex-col gap-3 px-6 py-5 bg-[#FDFAF4]/95 backdrop-blur-md rounded-2xl border border-[#FF6A00]/15 shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
          {NAV_ITEMS.map((item) =>
            item.external ? (
              <a key={item.label} href={item.href} className="text-sm font-medium text-muted hover:text-ink transition-colors">
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium ${isActive(item.href) ? 'text-orange' : 'text-ink'}`}
              >
                {item.label}
              </Link>
            )
          )}
          <a
            href="https://wa.me/5521990230538?text=Oi%2C%20tenho%20interesse%20na%20Blink."
            target="_blank"
            rel="noreferrer"
            className="brand-gradient text-paper font-semibold text-sm px-6 py-2.5 rounded-full text-center mt-1 hover:opacity-90 transition-opacity"
          >
            Fale Conosco
          </a>
        </div>
      )}
    </>
  );
}
