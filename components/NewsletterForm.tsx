'use client';
import { useState } from 'react';

export default function NewsletterForm() {
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [email, setEmail] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setState(res?.ok ? 'ok' : 'error');
  }

  if (state === 'ok') return <p className="text-sm">Pronto — você vai receber o radar da semana. 📬</p>;

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com.br"
        className="flex-1 min-h-[44px] rounded-full border border-line bg-white px-4 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
      />
      <button type="submit" disabled={state === 'loading'}
        className="brand-gradient min-h-[44px] rounded-full px-6 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
        {state === 'loading' ? 'Enviando…' : 'Assinar'}
      </button>
      {state === 'error' && <p className="text-sm text-red self-center">Falhou — tente de novo.</p>}
    </form>
  );
}
