import { ImageResponse } from 'next/og';
import { getPerspectiva } from '@/lib/content';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPerspectiva(slug);
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', background: '#0a0a0a', color: '#fafaf7', padding: 64,
        fontFamily: 'Georgia, serif',
      }}>
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.7 }}>
          Blink Perspectivas · {p?.category ?? ''}
        </div>
        <div style={{ display: 'flex', fontSize: 56, lineHeight: 1.15 }}>{p?.title ?? 'Blink Perspectivas'}</div>
        <div style={{ display: 'flex', fontSize: 24, opacity: 0.7 }}>blinkgroup.com.br/radar/perspectivas</div>
      </div>
    ),
    size,
  );
}
