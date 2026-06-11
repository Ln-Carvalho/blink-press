export default function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="[&_h2]:font-display [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:my-4 [&_p]:leading-relaxed [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1">
      {children}
    </div>
  );
}
