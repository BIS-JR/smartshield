import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { moduleIconMap, moduleRouteMap } from '@/lib/moduleIcons';
import type { ModuleDto, StatusCounts } from '@/lib/useModules';
import { MiniDonut } from './MiniDonut';
import { MiniBar } from './MiniBar';

interface ModuleCardProps {
  module: ModuleDto;
  counts?: StatusCounts;
  chart?: 'donut' | 'bar';
}

export function ModuleCard({ module, counts, chart }: ModuleCardProps) {
  const Icon = moduleIconMap[module.icon];
  const to = moduleRouteMap[module.key] ?? '/dashboard';

  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-lg border border-border p-5 transition-colors hover:border-primary"
      style={{
        backgroundImage: `linear-gradient(135deg, ${module.color}26, transparent 70%)`,
      }}
    >
      <ChevronRight className="absolute right-4 top-4 h-4 w-4 text-muted transition-colors group-hover:text-primary" />

      <div className="flex items-start justify-between gap-3">
        <div>
          {Icon && <Icon className="h-6 w-6" style={{ color: module.color }} />}
          <h3 className="mt-3 font-semibold text-foreground">{module.name}</h3>

          {counts && (
            <div className="mt-2 flex gap-3 text-xs">
              <span className="text-status-good">{counts.aprovado} aprov.</span>
              <span className="text-status-critical">{counts.rejeitado} rejeit.</span>
              <span className="text-status-info">{counts.aguardando} pend.</span>
            </div>
          )}
        </div>

        {counts && chart === 'donut' && <MiniDonut counts={counts} />}
        {counts && chart === 'bar' && <MiniBar counts={counts} />}
      </div>
    </Link>
  );
}
