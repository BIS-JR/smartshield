import { Activity, ShieldAlert, TriangleAlert, Zap, CreditCard } from 'lucide-react';
import { KpiCard } from '@/components/kpi-pattern/KpiCard';
import { ChartCardShell } from '@/components/kpi-pattern/ChartCardShell';
import { BarChartVertical } from '@/components/kpi-pattern/BarChartVertical';
import { DonutChart } from '@/components/kpi-pattern/DonutChart';
import { RecentAlertsList } from '@/components/kpi-pattern/RecentAlertsList';
import { usePaymentRiskSummary, usePaymentRiskAlerts } from './api';
import { useModules } from '@/lib/useModules';

export function PaymentRiskPage() {
  const { data: modules } = useModules();
  const module = modules?.find((m) => m.key === 'payment_risk');
  const { data: summary, isLoading } = usePaymentRiskSummary();
  const { data: alerts } = usePaymentRiskAlerts();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6" style={{ color: module?.color ?? '#199e70' }} />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Payment Risk Engine</h1>
          <p className="text-sm text-muted">Monitoramento de transações em tempo real</p>
        </div>
      </div>

      {isLoading && <p className="mt-8 text-sm text-muted">Carregando...</p>}

      {summary && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard icon={Activity} iconColor="var(--status-info)" value={summary.transactionsToday.toLocaleString('pt-BR')} label="Transações Hoje" />
            <KpiCard icon={ShieldAlert} iconColor="var(--status-critical)" value={summary.blocked.toLocaleString('pt-BR')} label="Bloqueadas" />
            <KpiCard icon={TriangleAlert} iconColor="var(--status-warning)" value={summary.suspicious.toLocaleString('pt-BR')} label="Suspeitas" />
            <KpiCard icon={Zap} iconColor="var(--status-good)" value={summary.activeAutomations.toLocaleString('pt-BR')} label="Automações Ativas" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ChartCardShell title="Transações por Tipo">
              <BarChartVertical
                data={[
                  { label: 'PIX', value: summary.byType.pix },
                  { label: 'TED', value: summary.byType.ted },
                  { label: 'DOC', value: summary.byType.doc },
                  { label: 'Boleto', value: summary.byType.boleto },
                ]}
                colors={['var(--module-payment-risk)', 'var(--status-good)', 'var(--module-corporate-fraud)', 'var(--status-warning)']}
              />
            </ChartCardShell>

            <ChartCardShell title="Distribuição de Risco">
              <DonutChart
                data={[
                  { key: 'baixo', label: 'Baixo Risco', value: summary.riskDistribution.baixo, color: 'var(--status-good)' },
                  { key: 'medio', label: 'Médio Risco', value: summary.riskDistribution.medio, color: 'var(--status-warning)' },
                  { key: 'alto', label: 'Alto Risco', value: summary.riskDistribution.alto, color: 'var(--status-critical)' },
                ]}
              />
            </ChartCardShell>
          </div>
        </>
      )}

      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-medium text-foreground">Alertas Recentes</h2>
        <RecentAlertsList alerts={alerts ?? []} detailPathPrefix="/payment-risk/alertas" />
      </div>
    </main>
  );
}
