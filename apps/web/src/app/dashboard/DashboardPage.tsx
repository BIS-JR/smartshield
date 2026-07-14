import { useModules, useDashboardSummary } from '@/lib/useModules';
import { ModuleCard } from './ModuleCard';

const CHART_BY_MODULE: Record<string, 'donut' | 'bar' | undefined> = {
  document_ai: 'donut',
  corporate_fraud: 'bar',
};

export function DashboardPage() {
  const { data: modules, isLoading } = useModules();
  const { data: summary } = useDashboardSummary();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold text-foreground">Painel Geral</h1>
      <p className="mt-1 text-sm text-muted">Selecione um módulo para acessar</p>

      {isLoading && <p className="mt-8 text-sm text-muted">Carregando módulos...</p>}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules?.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            counts={summary?.[module.key as 'document_ai' | 'corporate_fraud']}
            chart={CHART_BY_MODULE[module.key]}
          />
        ))}
      </div>
    </main>
  );
}
