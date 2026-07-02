export default function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        text-justified mt-8 text-[1.0625rem] leading-[1.75] text-ink
        [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:leading-snug
        [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-2
        [&_p]:my-5
        [&_a]:text-orange [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-orange/40 hover:[&_a]:decoration-orange
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-5 [&_li]:my-2
        [&_strong]:font-semibold [&_strong]:text-ink
        [&_blockquote]:border-l-2 [&_blockquote]:border-orange [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted [&_blockquote]:my-6
      "
    >
      {children}
    </div>
  );
}
