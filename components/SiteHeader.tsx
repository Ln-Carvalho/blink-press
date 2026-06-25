'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Limiar de scroll (px) para ativar o Estado B (cápsula flutuante)
const SCROLL_THRESHOLD = 80;

const NAV_FULL = [
  { label: 'Sobre',        href: 'https://blinkgroup.com.br', external: true  },
  { label: 'Como Atuamos', href: 'https://blinkgroup.com.br', external: true  },
  { label: 'Portfólio',    href: 'https://blinkgroup.com.br', external: true  },
  { label: 'Fundadores',   href: 'https://blinkgroup.com.br', external: true  },
  { label: 'Radar',        href: '/radar',                    external: false },
  { label: 'Research',     href: '/research',                 external: false },
  { label: 'Contato',      href: 'https://blinkgroup.com.br', external: true  },
];

const NAV_SHORT = NAV_FULL.filter((i) => !i.external);

interface SiteHeaderProps {
  /** Texto do selo de seção exibido à esquerda. */
  sectionLabel?: string;
}

export default function SiteHeader({ sectionLabel = 'RADAR' }: SiteHeaderProps) {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ─── Barra principal ─── */}
      <div
        className={`transition-all duration-300 ease-in-out flex items-center justify-between ${
          scrolled
            /*
             * Estado B: pill escuro semi-transparente, quase borda a borda,
             * backdrop-blur para efeito de vidro sobre o conteúdo.
             */
            ? 'bg-ink/80 backdrop-blur-md mx-3 mt-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.35)] px-5 h-14'
            /*
             * Estado A: pill sólido escuro, cantos arredondados, margem leve do topo.
             */
            : 'bg-ink mx-4 mt-3 rounded-2xl px-6 h-16'
        }`}
      >
        {/* Selo de seção — sempre cream (fundo sempre escuro) */}
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase font-medium select-none text-paper">
          {sectionLabel}
        </span>

        {/* ─── Navegação desktop ─── */}
        <nav
          className="hidden md:flex items-center gap-5 text-sm font-medium"
          aria-label="Navegação principal"
        >
          {scrolled ? (
            /* Estado B: nav completa em cream */
            <>
              {NAV_FULL.map((item) =>
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-paper/70 hover:text-paper transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative pb-0.5 transition-colors ${
                      isActive(item.href) ? 'text-paper' : 'text-paper/70 hover:text-paper'
                    }`}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span
                        className="absolute bottom-0 left-0 w-full h-px brand-gradient"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                )
              )}

              <a
                href="https://blinkgroup.com.br"
                className="brand-gradient text-paper text-sm font-medium px-5 py-2 rounded-full ml-1 hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                ← Voltar à home
              </a>
            </>
          ) : (
            /* Estado A: apenas Radar e Research */
            NAV_SHORT.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative pb-0.5 transition-colors ${
                  isActive(item.href) ? 'text-gold' : 'text-paper hover:text-gold'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span
                    className="absolute bottom-0 left-0 w-full h-px brand-gradient"
                    aria-hidden="true"
                  />
                )}
              </Link>
            ))
          )}
        </nav>

        {/* ─── Hambúrguer mobile ─── */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileOpen}
          className="md:hidden p-2 -mr-2 text-paper"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h14M3 10h14M3 14h14" />
            </svg>
          )}
        </button>
      </div>

      {/* ─── Menu mobile ─── */}
      {mobileOpen && (
        <div
          className={`md:hidden flex flex-col gap-3 px-6 py-5 ${
            scrolled
              ? 'mx-3 mt-1 bg-ink/90 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]'
              : 'mx-4 bg-ink rounded-b-2xl border-t border-white/10'
          }`}
        >
          {(scrolled ? NAV_FULL : NAV_SHORT).map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-paper/70"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium ${
                  isActive(item.href) ? 'brand-gradient-text' : 'text-paper'
                }`}
              >
                {item.label}
              </Link>
            )
          )}

          {scrolled && (
            <a
              href="https://blinkgroup.com.br"
              className="brand-gradient text-paper text-sm font-medium px-5 py-2.5 rounded-full text-center mt-1 hover:opacity-90 transition-opacity"
            >
              ← Voltar à home
            </a>
          )}
        </div>
      )}
    </header>
  );
}
