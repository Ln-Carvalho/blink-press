type Props = {
  href: string;
  variant?: 'primary' | 'compact';
};

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function PdfDownloadButton({ href, variant = 'primary' }: Props) {
  if (!href) return null;

  const base =
    'inline-flex items-center justify-center gap-2 min-h-[44px] rounded-full font-semibold transition';
  const styles =
    variant === 'primary'
      ? 'brand-gradient text-white px-6 text-sm hover:opacity-90'
      : 'border border-orange text-orange px-5 text-sm hover:bg-orange hover:text-white';

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${styles}`}>
      <DownloadIcon />
      Baixar PDF
    </a>
  );
}
