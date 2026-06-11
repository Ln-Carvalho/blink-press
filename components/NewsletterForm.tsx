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
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com.br"
        className="flex-1 border border-line bg-white px-3 py-2 text-sm rounded-none focus:outline-none focus:border-ink"
      />
      <button type="submit" disabled={state === 'loading'}
        className="bg-ink text-paper px-4 py-2 text-sm disabled:opacity-50">
        {state === 'loading' ? 'Enviando…' : 'Assinar'}
      </button>
      {state === 'error' && <p className="text-sm text-red-700 self-center">Falhou — tente de novo.</p>}
    </form>
  );
}
