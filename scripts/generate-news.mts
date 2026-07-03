import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { parsePipelineOutput } from '../lib/pipeline';

const client = new Anthropic(); // ANTHROPIC_API_KEY do ambiente

const hoje = new Date().toISOString().slice(0, 10);

const PROMPT = `Você é o editor do "Blink Group Radar", publicação da Blink Group para PMEs brasileiras.

Tarefa: usando busca na web, encontre A notícia mais relevante das últimas 72 horas para
pequenas e médias empresas no Brasil (temas: economia, crédito, regulação/tributos,
tecnologia aplicável, capital). Escreva uma análise original — nunca apenas repasse a notícia.

Regras editoriais:
- O diferencial é o campo "summary": a resposta direta a "por que isso importa para sua PME".
- Corpo: 3 a 5 parágrafos em português do Brasil, tom direto e prático, sem jargão.
- Cite de 1 a 3 fontes reais (as URLs que você de fato consultou na busca).
- category: exatamente um de Brasil | Mundo | Regulação | Tecnologia | Capital.
- date: ${hoje}.

Formato da resposta — exatamente assim, nada depois do fechamento:
<filename>${hoje}-slug-curto-em-kebab-case.mdx</filename>
<mdx>
---
title: "..."
date: ${hoje}
category: ...
summary: "..."
sources:
  - label: "..."
    url: "https://..."
status: draft
---

Corpo da análise em markdown.
</mdx>`;

async function main() {
  const stream = client.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 64000,
    thinking: { type: 'adaptive' },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [{ type: 'web_search_20260209', name: 'web_search' }] as any,
    messages: [{ role: 'user', content: PROMPT }],
  });
  const message = await stream.finalMessage();

  if (message.stop_reason === 'refusal') throw new Error('Modelo recusou a tarefa');

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  const { filename, mdx } = parsePipelineOutput(text);
  const dest = path.join(process.cwd(), 'content', 'radar', filename);
  if (fs.existsSync(dest)) {
    console.log(`Já existe ${filename} — nada a fazer.`);
    return;
  }
  fs.writeFileSync(dest, mdx);
  console.log(`Rascunho criado: content/radar/${filename}`);
}

main().catch((err) => {
  // fail-safe: erro = nenhum arquivo escrito = nada publicado
  console.error(err);
  process.exit(1);
});
