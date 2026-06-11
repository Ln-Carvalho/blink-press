import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-display text-5xl italic">404</p>
      <p className="mt-4 text-muted">Essa página não existe ou ainda não foi publicada.</p>
      <Link href="/radar" className="mt-6 inline-block underline underline-offset-2">Voltar ao Radar</Link>
    </div>
  );
}
