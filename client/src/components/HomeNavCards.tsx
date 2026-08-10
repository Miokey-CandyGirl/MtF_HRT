import { useUIStore } from '@/store';
import { NAV_CARDS } from '@/constants';
import { cn } from '@/lib/utils';

export function HomeNavCards() {
  const setView = useUIStore((s) => s.setView);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {NAV_CARDS.map((c) => (
        <button
          key={c.view}
          type="button"
          onClick={() => setView(c.view)}
          className={cn(
            'hover-lift group flex flex-col items-start gap-1 rounded-2xl border border-border bg-card p-4 text-left card-shadow hover:border-primary/50',
          )}
        >
          <span className="text-2xl transition-transform group-hover:scale-110" aria-hidden>
            {c.emoji}
          </span>
          <span className="font-bold text-foreground">{c.title}</span>
          <span className="text-xs text-muted-foreground">{c.desc}</span>
        </button>
      ))}
    </div>
  );
}
