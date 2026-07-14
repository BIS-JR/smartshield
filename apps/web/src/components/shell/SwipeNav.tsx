import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useModules } from '@/lib/useModules';
import { moduleRouteMap } from '@/lib/moduleIcons';

export function SwipeNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: modules } = useModules();

  if (!modules || modules.length === 0) return null;

  const routes = modules.map((m) => moduleRouteMap[m.key]).filter(Boolean);
  const currentIndex = routes.indexOf(pathname);

  function go(direction: -1 | 1) {
    if (currentIndex === -1) {
      navigate(routes[0]);
      return;
    }
    const nextIndex = (currentIndex + direction + routes.length) % routes.length;
    navigate(routes[nextIndex]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Módulo anterior"
        className="fixed left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border bg-surface p-2 text-muted hover:text-foreground"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Próximo módulo"
        className="fixed right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border bg-surface p-2 text-muted hover:text-foreground"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </>
  );
}
