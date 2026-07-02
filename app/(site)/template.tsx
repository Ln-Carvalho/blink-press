export default function Template({ children }: { children: React.ReactNode }) {
  // Templates remontam a cada navegação, disparando a animação de entrada da página
  return <div className="page-enter">{children}</div>;
}
