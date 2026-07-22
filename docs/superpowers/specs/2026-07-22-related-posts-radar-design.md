# Leituras sugeridas no rodapé do post (Radar)

## Contexto

Hoje, ao final de cada post do Radar (`app/(site)/radar/[slug]/page.tsx`), existe apenas um link de texto discreto "← Radar" que volta para a listagem. Não existe nenhum mecanismo de "posts relacionados" no código (nem componente, nem lógica de seleção), e o schema de posts (Keystatic, `keystatic.config.ts` / `lib/schemas.ts`) não tem campo de imagem de capa.

Objetivo: substituir esse link por uma seção com 3 blocos lado a lado sugerindo outras leituras, mais um CTA para a listagem completa.

## Escopo

- Aplica-se **somente** à página de post individual do Radar: `app/(site)/radar/[slug]/page.tsx`.
- Não se aplica a Research (`app/(site)/research/[slug]/page.tsx`) nem às rotas de preview do Keystatic (`app/preview/**`).

## Dados dos posts disponíveis

Collection `radar` (Keystatic), campos relevantes: `title`, `slug` (derivado do nome do arquivo), `status` (`draft`/`published`), `date`, `category` (`ARTICLE_CATEGORIES`), `summary`. Sem campo de imagem de capa — os cards da nova seção não usam imagem.

## Lógica de seleção (2 relacionados + 1 mais recente)

Nova função `getRelatedArticles(current: Entry<RadarPost>, all: Entry<RadarPost>[])` em `lib/content.ts`:

1. Filtra todos os posts `published`, excluindo o post atual (`slug !== current.slug`).
2. Ordena por `date` decrescente.
3. Seleciona os **2 mais recentes da mesma `category`** do post atual.
4. Seleciona o **post mais recente geral** (qualquer categoria), excluindo o atual e os já selecionados no passo 3.
5. **Fallback**: se a categoria do post atual não tiver 2 outros posts publicados, completa as vagas restantes (para fechar 3 no total) com os próximos posts mais recentes de qualquer categoria, sem duplicar os já selecionados.
6. Resultado final: até 3 posts, sem duplicatas, sem o post atual. Se não houver posts suficientes no site (edge case raro, ex. site novo), a seção renderiza com menos de 3 cards em vez de quebrar.
7. Ordem de exibição dos 3 cards: os 2 relacionados por categoria primeiro, depois o mais recente geral por último.

## Componente visual

Novo componente `components/RelatedPosts.tsx`:

- Recebe a lista de posts relacionados (já resolvida pela função acima) como prop.
- Cada card é **minimalista**: `Chip` de categoria (reaproveitando o padrão visual do `Chip` já usado em `app/(site)/radar/page.tsx` — será extraído para um local compartilhado, ex. `components/Chip.tsx`, já que hoje está definido localmente e não exportado) + título do post (link para `/radar/{slug}`). Sem resumo, sem data, sem imagem.
- Estilo visual consistente com os `glass-card` já usados no site, porém mais compacto (menos padding que os cards da listagem).
- Grid responsivo: 1 coluna no mobile (`grid-cols-1`), 3 colunas a partir do breakpoint `sm` (`sm:grid-cols-3`).
- Título de seção acima da grade (ex. "Leituras sugeridas").

## Integração na página do post

Em `app/(site)/radar/[slug]/page.tsx`, o bloco atual (linhas 119-125, o `<Link href="/radar">← Radar</Link>`) é substituído por:

1. Chamada a `getRelatedArticles` (dados resolvidos no server component, sem novo fetch client-side).
2. Renderização do heading + `<RelatedPosts posts={...} />`.
3. Abaixo da grade, um **CTA destacado** ("Ver todas as notícias →" ou texto similar) como botão, linkando para `/radar` — substitui o antigo link de texto discreto. Full-width no mobile.
4. Mantém o wrapper `<AnimateOnView>` existente para consistência com o resto das animações da página (a definir na implementação se aplica ao bloco inteiro ou por elemento).

## Mobile

- Cards empilham em coluna única abaixo de `sm`.
- CTA button full-width no mobile, auto-width no desktop.
- Segue a preferência já registrada do projeto de sempre otimizar para mobile em mudanças de frontend no blink-press.

## Fora de escopo

- Adicionar campo de imagem de capa ao schema de posts.
- Aplicar a mesma seção em Research ou nas rotas de preview.
- Qualquer forma de recomendação por tags/similaridade textual (não existe esse dado hoje).
