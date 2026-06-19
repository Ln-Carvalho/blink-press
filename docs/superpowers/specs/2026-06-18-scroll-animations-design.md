# Scroll Animations & External Links Design

**Date:** 2026-06-18
**Branch:** nova-página-de-blog (or next branch)

## Goal

Add scroll-triggered slide-up animations to all pages of blink-press (Radar, Research, Perspectivas — list and detail pages), and make all external hyperlinks in MDX content open in a new tab.

## Approach

CSS + IntersectionObserver — zero new dependencies. Two client-side wrapper components handle all animation. Animation styles live in `globals.css`. No Framer Motion or other animation library.

## Components

### `components/AnimateOnView.tsx`

Client component (`'use client'`). Wraps any element and triggers a slide-up fade-in when it enters the viewport.

**Props:**
- `children: React.ReactNode`
- `delay?: number` — milliseconds before animation starts (default: 0). Used for stagger effects between cards.
- `className?: string` — forwarded to the wrapper `div`

**Behavior:**
- On mount, registers an `IntersectionObserver` with `threshold: 0.1` and `rootMargin: '0px 0px -40px 0px'`
- When element enters viewport: adds class `is-visible` to the wrapper div
- Observer disconnects after first trigger (animate once, not every scroll)
- Initial state: `opacity: 0; transform: translateY(20px)`
- Final state: `opacity: 1; transform: translateY(0)`
- Transition: `0.5s ease` for both opacity and transform

**Usage on listing pages:**
```tsx
<AnimateOnView delay={0}><header>…</header></AnimateOnView>
<AnimateOnView delay={80}>{/* destaque card */}</AnimateOnView>
{resto.map((item, i) => (
  <AnimateOnView key={item.slug} delay={Math.min(i, 4) * 80}>
    {/* card */}
  </AnimateOnView>
))}
<AnimateOnView delay={0}>{/* aside */}</AnimateOnView>
```

### `components/ProseAnimated.tsx`

Client component (`'use client'`). Wraps the MDX article body and animates each text child individually as it scrolls into view.

**Props:**
- `children: React.ReactNode` — receives `<Prose><MDXRemote .../></Prose>` as RSC output

**Behavior:**
- Renders a `<div ref={containerRef}>` wrapping children
- After mount (`useEffect`), queries all `p, h2, h3, li` within the container
- Registers an individual `IntersectionObserver` on each element
- Each element starts hidden (`opacity: 0; translateY(16px)`) and animates to visible when it enters the viewport
- Observer disconnects per element after first trigger
- Elements already in view on page load animate immediately (threshold 0.1)

**Usage on detail pages:**
```tsx
<ProseAnimated>
  <Prose>
    <MDXRemote source={content} components={{ a: ExternalLink }} />
  </Prose>
</ProseAnimated>
```

### `components/ExternalLink.tsx`

Client-or-server component. Custom `a` tag passed as MDX component override to `MDXRemote`.

**Behavior:**
- If `href` starts with `http://` or `https://`: renders `<a target="_blank" rel="noopener noreferrer" …>`
- Otherwise (relative path): renders standard `<a …>` (same tab)
- Forwards all other props (`className`, `children`, etc.)

**Not applied to:** navigation `<Link>` components in headers, footers, asides — those are internal Next.js routes and stay in same tab.

## CSS (`app/globals.css`)

Add to globals.css:

```css
/* Scroll animations */
.animate-on-view {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.animate-on-view.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Prose child animations */
.prose-child-hidden {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.prose-child-hidden.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-on-view,
  .prose-child-hidden {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

## Pages Modified

### Listing pages (3 files)

Apply `AnimateOnView` to structural blocks in:

- `app/(site)/radar/page.tsx`
- `app/(site)/radar/perspectivas/page.tsx`
- `app/(site)/research/page.tsx`

Wrap targets: page `<header>`, destaque article block, each card in the list (stagger delay = `Math.min(index, 4) * 80`ms), each `<aside>` block.

### Detail pages (3 files)

Apply staggered `AnimateOnView` to the article header and summary callout, and `ProseAnimated` to the MDX body in:

- `app/(site)/radar/[slug]/page.tsx`
- `app/(site)/radar/perspectivas/[slug]/page.tsx`
- `app/(site)/research/[slug]/page.tsx`

Pass `ExternalLink` as `components={{ a: ExternalLink }}` to each `MDXRemote`.

Wrap targets:
- `<p>` label (category · date): `AnimateOnView delay={0}`
- `<h1>`: `AnimateOnView delay={80}`
- Summary callout div: `AnimateOnView delay={160}`
- MDX body: `ProseAnimated`
- Footer (sources or back link): `AnimateOnView delay={0}`

## Constraints

- SSG: all components that use hooks must be `'use client'`; RSC output can be passed as `children` to client components in Next.js App Router
- `prefers-reduced-motion`: animations disabled via CSS media query — no JS check needed
- No new npm packages
- Existing `transition-colors` hover classes are unchanged
- `dynamicParams = false` on detail pages is unchanged

## Files Summary

| Action | File |
|--------|------|
| Create | `components/AnimateOnView.tsx` |
| Create | `components/ProseAnimated.tsx` |
| Create | `components/ExternalLink.tsx` |
| Modify | `app/globals.css` |
| Modify | `app/(site)/radar/page.tsx` |
| Modify | `app/(site)/radar/perspectivas/page.tsx` |
| Modify | `app/(site)/research/page.tsx` |
| Modify | `app/(site)/radar/[slug]/page.tsx` |
| Modify | `app/(site)/radar/perspectivas/[slug]/page.tsx` |
| Modify | `app/(site)/research/[slug]/page.tsx` |
