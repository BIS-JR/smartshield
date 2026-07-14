import { Shield, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { KpiCard } from '@/components/kpi-pattern/KpiCard';
import { ChartCardShell } from '@/components/kpi-pattern/ChartCardShell';
import { BarChartVertical } from '@/components/kpi-pattern/BarChartVertical';
import { DonutChart } from '@/components/kpi-pattern/DonutChart';
import { AreaChartMultiSeries } from '@/components/kpi-pattern/AreaChartMultiSeries';
import { RiskBar } from '@/components/kpi-pattern/RiskBar';
import { useExecutiveSummary, useFraudByModule, useSeverityDistribution, useTrends, useRegionRisk } from './api';
import { useModules } from '@/lib/useModules';

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDayLabel(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function ExecutiveDashboardPage() {
  const { data: modules } = useModules();
  const module = modules?.find((m) => m.key === 'executive_dashboard');
  const { data: summary, isLoading } = useExecutiveSummary();
  const { data: fraudByModule } = useFraudByModule();
  const { data: severity } = useSeverityDistribution();
  const { data: trends } = useTrends();
  const { data: regionRisk } = useRegionRisk();

  const moduleColor = (key: string) => modules?.find((m) => m.key === key)?.color ?? '#8a9ab0';

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6" style={{ color: module?.color ?? '#d55181' }} />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Executive Dashboard</h1>
          <p className="text-sm text-muted">Visão consolidada de KPIs e tendências</p>
        </div>
      </div>

      {isLoading && <p className="mt-8 text-sm text-muted">Carregando...</p>}

      {summary && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard icon={Shield} iconColor="var(--status-info)" value={summary.totalIncidents.toLocaleString('pt-BR')} label="Total de Incidências" />
          <KpiCard icon={TrendingUp} iconColor="var(--status-critical)" value={summary.fraudsDetected.toLocaleString('pt-BR')} label="Fraudes Detectadas" />
          <KpiCard icon={Shield} iconColor="var(--status-good)" value={summary.activeBlocks.toLocaleString('pt-BR')} label="Bloqueios Ativos" />
          <KpiCard icon={DollarSign} iconColor="var(--status-good)" value={formatCurrency(summary.estimatedRoi)} label="ROI Estimado" />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChartCardShell title="Fraudes por Módulo">
          {fraudByModule && (
            <BarChartVertical
              data={[
                { label: 'Document AI', value: fraudByModule.document_ai },
                { label: 'Corporate', value: fraudByModule.corporate_fraud },
                { label: 'Supplier', value: fraudByModule.supplier_intelligence },
              ]}
              colors={[moduleColor('document_ai'), moduleColor('corporate_fraud'), moduleColor('supplier_intelligence')]}
            />
          )}
        </ChartCardShell>

        <ChartCardShell title="Distribuição por Severidade">
          {severity && (
            <DonutChart
              data={[
                { key: 'leve', label: 'Leve', value: severity.leve, color: 'var(--status-warning)' },
                { key: 'moderado', label: 'Moderado', value: severity.moderado, color: 'var(--status-serious)' },
                { key: 'grave', label: 'Grave', value: severity.grave, color: 'var(--status-critical)' },
              ]}
            />
          )}
        </ChartCardShell>

        <ChartCardShell title="Tendências — Última Semana">
          {trends && (
            <AreaChartMultiSeries
              labels={trends.days.map(formatDayLabel)}
              series={[
                { key: 'documentAi', label: 'Document AI', color: moduleColor('document_ai'), values: trends.documentAi },
                { key: 'corporateFraud', label: 'Corporate', color: moduleColor('corporate_fraud'), values: trends.corporateFraud },
                { key: 'supplierIntelligence', label: 'Supplier', color: moduleColor('supplier_intelligence'), values: trends.supplierIntelligence },
              ]}
            />
          )}
        </ChartCardShell>

        <ChartCardShell title="Mapa de Risco por Região">
          <div className="space-y-3">
            {regionRisk?.map((r) => (
              <RiskBar key={r.region} label={r.region} percentage={r.riskPercentage} incidentCount={r.incidentCount} />
            ))}
          </div>
        </ChartCardShell>
      </div>
    </main>
  );
}
