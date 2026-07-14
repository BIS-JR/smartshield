import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { RightDrawer } from './RightDrawer';
import { useModules } from '@/lib/useModules';
import { moduleIconMap, moduleRouteMap } from '@/lib/moduleIcons';

interface ModuleHelpDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModuleHelpDrawer({ open, onOpenChange }: ModuleHelpDrawerProps) {
  const { data: modules } = useModules();

  return (
    <RightDrawer open={open} onOpenChange={onOpenChange} title="Ajuda — Módulos">
      <div className="flex flex-col gap-3">
        <Link
          to="/dashboard"
          onClick={() => onOpenChange(false)}
          className="rounded-md border border-border bg-background p-4 transition-colors hover:border-primary"
        >
          <div className="flex items-center gap-2 font-medium text-primary">
            <LayoutGrid className="h-4 w-4" />
            Tela Geral
          </div>
          <p className="mt-1 text-sm text-muted">Mosaico com acesso rápido a todos os módulos de proteção antifraude.</p>
        </Link>

        {modules?.map((module) => {
          const Icon = moduleIconMap[module.icon];
          return (
            <Link
              key={module.id}
              to={moduleRouteMap[module.key] ?? '/dashboard'}
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-border bg-background p-4 transition-colors hover:border-primary"
            >
              <div className="flex items-center gap-2 font-medium text-primary">
                {Icon && <Icon className="h-4 w-4" />}
                {module.name}
              </div>
              <p className="mt-1 text-sm text-muted">{module.description}</p>
            </Link>
          );
        })}
      </div>
    </RightDrawer>
  );
}
