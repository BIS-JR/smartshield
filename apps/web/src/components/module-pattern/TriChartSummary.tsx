import type { StatusCounts } from '@/lib/useModules';
import { SummaryCard } from './SummaryCard';

interface TriChartSummaryProps {
  counts: StatusCounts;
  chart: 'donut' | 'bar';
}

export function TriChartSummary({ counts, chart }: TriChartSummaryProps) {
  const aprovadosOnly: StatusCounts = { aprovado: counts.aprovado, rejeitado: 0, aguardando: 0 };
  const rejeitadosOnly: StatusCounts = { aprovado: 0, rejeitado: counts.rejeitado, aguardando: 0 };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard title="Aprovados" counts={aprovadosOnly} chart={chart} />
      <SummaryCard title="Rejeitados" counts={rejeitadosOnly} chart={chart} />
      <SummaryCard title="Visão Geral" counts={counts} chart={chart} />
    </div>
  );
}
