import Image from 'next/image';
import logo from '@/public/brand/LogoBlink_Preta.png';
import SiteHeader from '@/components/SiteHeader';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-3xl px-5 pt-40 pb-10 sm:pb-14">{children}</main>

      <footer className="mt-8">
        <div className="brand-gradient divider-draw h-[2px] w-full" />
        <div className="mx-auto max-w-3xl px-5 py-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
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
