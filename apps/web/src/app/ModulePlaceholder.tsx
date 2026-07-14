import { moduleIconMap } from '@/lib/moduleIcons';
import { useModules } from '@/lib/useModules';

export function ModulePlaceholder({ moduleKey }: { moduleKey: string }) {
  const { data: modules } = useModules();
  const module = modules?.find((m) => m.key === moduleKey);
  const Icon = module ? moduleIconMap[module.icon] : undefined;

  return (
    <main className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-24 text-center">
      {Icon && <Icon className="h-8 w-8" style={{ color: module?.color }} />}
      <h1 className="text-xl font-semibold text-foreground">{module?.name ?? 'Módulo'}</h1>
      <p className="text-sm text-muted">{module?.description}</p>
      <p className="mt-4 text-xs text-muted">Esta tela ainda será construída numa próxima fase.</p>
    </main>
  );
}
