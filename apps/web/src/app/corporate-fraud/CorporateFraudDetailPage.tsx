import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Snowflake, ShieldCheck } from 'lucide-react';
import { DetailPageShell } from '@/components/module-pattern/DetailPageShell';
import { ActionButtonGroup } from '@/components/module-pattern/ActionButtonGroup';
import { EmailReportButton } from '@/components/module-pattern/EmailReportButton';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from '@/components/badges/CategoryBadge';
import { CORPORATE_CATEGORY_LABEL } from '@/components/badges/CorporateCategoryLabel';
import { SeverityBadge } from '@/components/badges/SeverityBadge';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { NetworkGraph } from './NetworkGraph';
import {
  useCorporateFraudDetail,
  useCorporateFraudGraph,
  useCorporateFraudDecision,
  useCorporateFraudReport,
  useCorporateFraudFreeze,
  type ReportType,
} from './api';

const REPORT_TYPES: { type: ReportType; label: string }[] = [
  { type: 'rede_relacionamentos', label: 'Rede de Relacionamentos' },
  { type: 'nos_suspeitos', label: 'Nós Suspeitos' },
  { type: 'casca_cebola', label: 'Casca de Cebola' },
];

export function CorporateFraudDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading } = useCorporateFraudDetail(id);
  const { data: graph } = useCorporateFraudGraph(id);
  const decision = useCorporateFraudDecision(id!);
  const report = useCorporateFraudReport(id!);
  const freeze = useCorporateFraudFreeze(id!);
  const [frozen, setFrozen] = useState(false);

  if (isLoading || !item) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <p className="text-sm text-muted">Carregando...</p>
      </main>
    );
  }

  const isPending = item.status === 'aguardando';

  return (
    <DetailPageShell
      backTo="/corporate-fraud"
      title={item.title}
      subtitle={item.entityNumber}
      actions={
        <ActionButtonGroup
          disabled={!isPending || decision.isPending}
          onBlock={() => decision.mutate('bloquear')}
          onRelease={() => decision.mutate('liberar')}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge label={CORPORATE_CATEGORY_LABEL[item.category] ?? item.category} />
        <SeverityBadge severity={item.severity} />
        <StatusBadge status={item.status} />
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Documento</dt>
          <dd className="text-foreground">{item.docNumber}</dd>
        </div>
        <div>
          <dt className="text-muted">Camadas de ocultação</dt>
          <dd className="text-foreground">{item.layersCount}</dd>
        </div>
        <div>
          <dt className="text-muted">Beneficiário final (UBO)</dt>
          <dd className="flex items-center gap-1.5 text-foreground">
            {item.uboIdentified ? (
              <>
                <ShieldCheck className="h-4 w-4 text-status-good" />
                {item.uboName}
              </>
            ) : (
              'Não identificado'
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Confiança do modelo</dt>
          <dd className="text-foreground">{Math.round(Number(item.confidenceScore) * 100)}%</dd>
        </div>
      </dl>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-muted">Grafo de rede</h3>
        <div className="mt-2">
          {graph && graph.nodes.length > 0 ? (
            <NetworkGraph nodes={graph.nodes} edges={graph.edges} />
          ) : (
            <p className="text-sm text-muted">Carregando grafo...</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {REPORT_TYPES.map(({ type, label }) => (
          <EmailReportButton
            key={type}
            label={label}
            onSend={(email) => report.mutateAsync({ reportType: type, recipientEmail: email })}
          />
        ))}
      </div>

      <div className="mt-4">
        <Button
          variant="destructive"
          size="sm"
          disabled={freeze.isPending || frozen}
          onClick={() => freeze.mutate(undefined, { onSuccess: () => setFrozen(true) })}
        >
          <Snowflake className="h-4 w-4" />
          {frozen ? 'Transações congeladas' : 'Congelar transações PIX/TED vinculadas'}
        </Button>
      </div>
    </DetailPageShell>
  );
}
