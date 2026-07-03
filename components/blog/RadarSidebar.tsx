interface RadarSidebarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function RadarSidebar({ categories, activeCategory, onSelectCategory }: RadarSidebarProps) {
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Blink Group Radar</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight">Notícias que importam para sua PME</h1>
      </header>

      <nav className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
        {categories.map((cat) => {
          const active = cat === activeCategory;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={
                active
                  ? 'brand-gradient inline-flex min-h-[36px] items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white'
                  : 'inline-flex min-h-[36px] items-center rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:border-orange/40 hover:text-ink'
              }
            >
              {cat}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
