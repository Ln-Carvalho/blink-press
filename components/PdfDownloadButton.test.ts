import { describe, it, expect } from 'vitest';
import PdfDownloadButton from './PdfDownloadButton';

describe('PdfDownloadButton', () => {
  it('renders nothing when href is empty', () => {
    expect(PdfDownloadButton({ href: '' })).toBeNull();
  });

  it('renders an external anchor when href is provided', () => {
    const el = PdfDownloadButton({ href: 'https://example.com/p.pdf' }) as React.ReactElement<
      { href: string; target: string; rel: string }
    >;
    expect(el).not.toBeNull();
    expect(el.type).toBe('a');
    expect(el.props.href).toBe('https://example.com/p.pdf');
    expect(el.props.target).toBe('_blank');
    expect(el.props.rel).toBe('noopener noreferrer');
  });
});
