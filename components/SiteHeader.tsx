'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import logoCompleta from '@/public/brand/LogoBlink_Completa_Preta.png';

const NAV_ITEMS = [
  { label: 'Sobre',        href: 'https://blinkgroup.com.br/#sobre',        external: true  },
  { label: 'Como Atuamos', href: 'https://blinkgroup.com.br/#como-atuamos', external: true  },
  { label: 'Portfólio',    href: 'https://blinkgroup.com.br/#portfolio',    external: true  },
  { label: 'Radar',        href: '/radar',                                  external: false },
  { label: 'Research',     href: '/research',                               external: false },
  { label: 'Fundadores',   href: 'https://blinkgroup.com.br/#fundadores',   external: true  },
  { label: 'Contato',      href: 'https://blinkgroup.com.br/#contato',      external: true  },
];

const WHATSAPP_HREF = 'https://wa.me/5521990230538?text=Oi%2C%20tenho%20interesse%20na%20Blink.';

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    !item.external && pathname.startsWith(item.href);

  // Sobre o overlay escuro do menu mobile, o nav precisa do estado "pílula" para seguir legível
  const showPill = isScrolled || mobileMenuOpen;

  return (
    <>
      <nav
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 rounded-full transition-all duration-400 ease-in-out w-[90%] max-w-5xl text-ink ${
          showPill
            ? 'bg-[#FDFAF4]/80 backdrop-blur-md border border-[#FF6A00]/15'
            : 'bg-transparent border border-transparent'
        }`}
        aria-label="Navegação principal"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="https://blinkgroup.com.br">
            <Image
              src={logoCompleta}
              alt="Blink"
              className={`w-auto transition-all duration-300 ${
                isScrolled ? 'h-[3.75rem] lg:h-[4.5rem]' : 'h-[4.5rem] lg:h-20'
              }`}
            />
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 font-body font-medium text-sm">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const className = `relative hover:text-orange py-1 transition-colors ${active ? 'text-orange' : ''}`;
            const underline = active && (
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-orange rounded-full animate-[underlineSlide_0.3s_ease-out]" />
            );
            return item.external ? (
              <a key={item.label} href={item.href} className={className}>
                {item.label}
                {underline}
              </a>
            ) : (
              <Link key={item.label} href={item.href} className={className}>
                {item.label}
                {underline}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noreferrer"
            className="brand-gradient text-ink font-body font-semibold text-sm px-6 py-2.5 rounded-full hover:scale-105 transition-transform inline-block relative overflow-hidden group"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              // Mapeia a posição x linearmente de 0deg (borda esquerda) a 135deg (borda direita)
              const angle = (x / rect.width) * 135;
              e.currentTarget.style.setProperty('--gradient-angle', `${angle}deg`);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty('--gradient-angle', `135deg`);
            }}
          >
            Fale Conosco
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
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

      {/* Mobile Menu Fullscreen Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-ink text-paper flex flex-col justify-center items-center">
          <div className="flex flex-col items-center gap-8 font-display text-4xl">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const className = `relative hover:text-orange transition-colors ${active ? 'text-orange' : ''}`;
              return item.external ? (
                <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className={className}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className={className}>
                  {item.label}
                </Link>
              );
            })}
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-8 brand-gradient text-ink font-body font-semibold text-lg px-8 py-4 rounded-full"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      )}
    </>
  );
}
