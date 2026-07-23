export default function Chip({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={
        active
          ? 'brand-gradient text-white inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide'
          : 'inline-block rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted'
      }
    >
      {children}
    </span>
  );
}
