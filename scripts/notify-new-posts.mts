// Dispara a newsletter (broadcast no Resend) para posts do Radar recém-publicados.
// Idempotente: o nome do broadcast é o slug do post — o que já existe no Resend
// nunca é reenviado, então é seguro rodar em todo deploy de produção.
//
// Regras de elegibilidade:
//   - status: published
//   - data do post dentro dos últimos 7 dias (o backlog antigo nunca dispara)
//   - nenhum broadcast com o nome do slug no Resend
//
// Env: RESEND_API_KEY, RESEND_AUDIENCE_ID, NEWSLETTER_SITE_URL (opcional)

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { Resend } from 'resend';
import { newPostEmail, NEWSLETTER_FROM } from '../lib/emails';

const RECENCY_DAYS = 7;

const apiKey = process.env.RESEND_API_KEY;
const audienceId = process.env.RESEND_AUDIENCE_ID;
if (!apiKey || !audienceId) {
  console.error('RESEND_API_KEY e RESEND_AUDIENCE_ID são obrigatórias.');
  process.exit(1);
}
const resend = new Resend(apiKey);

const radarDir = path.join(process.cwd(), 'content', 'radar');
const cutoff = Date.now() - RECENCY_DAYS * 24 * 60 * 60 * 1000;

const candidates = fs
  .readdirSync(radarDir)
  .filter((f) => f.endsWith('.mdx'))
  .map((file) => {
    const { data } = matter(fs.readFileSync(path.join(radarDir, file), 'utf8'));
    return {
      slug: file.replace(/\.mdx$/, ''),
      title: String(data.title ?? ''),
      summary: String(data.summary ?? ''),
      category: String(data.category ?? 'Radar'),
      date: new Date(data.date),
      status: String(data.status ?? 'draft'),
    };
  })
  .filter((p) => p.status === 'published' && p.date.getTime() >= cutoff);

if (candidates.length === 0) {
  console.log('Nenhum post recente para anunciar.');
  process.exit(0);
}

const { data: list, error: listError } = await resend.broadcasts.list();
if (listError) {
  console.error('Falha ao listar broadcasts:', listError);
  process.exit(1);
}
const alreadySent = new Set((list?.data ?? []).map((b) => b.name).filter(Boolean));

let failures = 0;
for (const post of candidates) {
  if (alreadySent.has(post.slug)) {
    console.log(`Já anunciado, pulando: ${post.slug}`);
    continue;
  }
  const { subject, html } = newPostEmail(post);
  const { data: created, error: createError } = await resend.broadcasts.create({
    name: post.slug,
    audienceId,
    from: NEWSLETTER_FROM,
    subject,
    html,
  });
  if (createError || !created) {
    console.error(`Falha ao criar broadcast de ${post.slug}:`, createError);
    failures++;
    continue;
  }
  const { error: sendError } = await resend.broadcasts.send(created.id);
  if (sendError) {
    console.error(`Broadcast criado mas não enviado (${post.slug}):`, sendError);
    failures++;
    continue;
  }
  console.log(`Newsletter enviada: ${post.slug} — "${subject}"`);
}

process.exit(failures > 0 ? 1 : 0);
