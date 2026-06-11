import { describe, it, expect } from 'vitest';
import { parsePipelineOutput } from '../lib/pipeline';

const mdx = `---
title: Selic cai e crédito para PME fica mais barato
date: 2026-06-12
category: Capital
summary: Cada ponto a menos na Selic reduz o custo do capital de giro.
sources:
  - label: Banco Central
    url: https://www.bcb.gov.br/
status: published
---

Corpo da análise.`;

const output = `Pesquisei as fontes e preparei a notícia.
<filename>2026-06-12-selic-cai-credito-pme.mdx</filename>
<mdx>
${mdx}
</mdx>`;

describe('parsePipelineOutput', () => {
  it('extrai filename e mdx, valida frontmatter e FORÇA status draft', () => {
    const r = parsePipelineOutput(output);
    expect(r.filename).toBe('2026-06-12-selic-cai-credito-pme.mdx');
    expect(r.mdx).toContain('Corpo da análise.');
    expect(r.mdx).toMatch(/status: draft/); // mesmo que a IA mande published
    expect(r.mdx).not.toMatch(/status: published/);
  });
  it('rejeita output sem marcadores', () => {
    expect(() => parsePipelineOutput('sem marcadores')).toThrow(/marcadores/);
  });
  it('rejeita frontmatter inválido (fail-safe: nada é escrito)', () => {
    const bad = output.replace('category: Capital', 'category: Esportes');
    expect(() => parsePipelineOutput(bad)).toThrow();
  });
  it('rejeita filename fora do padrao YYYY-MM-DD-slug.mdx', () => {
    const bad = output.replace('<filename>2026-06-12-selic-cai-credito-pme.mdx</filename>', '<filename>../../etc/passwd</filename>');
    expect(() => parsePipelineOutput(bad)).toThrow(/filename/);
  });
  it('rejeita corpo com import/export (MDX executável)', () => {
    const bad = output.replace('Corpo da análise.', 'import x from "y"\n\nCorpo.');
    expect(() => parsePipelineOutput(bad)).toThrow(/executáveis/);
  });
  it('rejeita corpo com JSX/expressões', () => {
    expect(() => parsePipelineOutput(output.replace('Corpo da análise.', 'Texto <Comp /> aqui.'))).toThrow(/executáveis/);
    expect(() => parsePipelineOutput(output.replace('Corpo da análise.', 'Total: {process.env.X}'))).toThrow(/executáveis/);
  });
  it('aceita markdown comum (links, ênfase, headings)', () => {
    const ok = output.replace('Corpo da análise.', '## Título\n\nVeja [o estudo](https://example.com) — **importante** para PMEs.');
    expect(parsePipelineOutput(ok).mdx).toContain('[o estudo](https://example.com)');
  });
});
