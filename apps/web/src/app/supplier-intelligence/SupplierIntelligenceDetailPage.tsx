import { useParams } from 'react-router-dom';
import { DetailPageShell } from '@/components/module-pattern/DetailPageShell';
import { ActionButtonGroup } from '@/components/module-pattern/ActionButtonGroup';
import { EmailReportButton } from '@/components/module-pattern/EmailReportButton';
import { CategoryBadge } from '@/components/badges/CategoryBadge';
import { SUPPLIER_CATEGORY_LABEL } from '@/components/badges/SupplierCategoryLabel';
import { SeverityBadge } from '@/components/badges/SeverityBadge';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { useSupplierIntelligenceDetail, useSupplierIntelligenceDecision, useSupplierIntelligenceReport } from './api';

export function SupplierIntelligenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading } = useSupplierIntelligenceDetail(id);
  const decision = useSupplierIntelligenceDecision(id!);
  const report = useSupplierIntelligenceReport(id!);

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
      backTo="/supplier-intelligence"
      title={item.description}
      subtitle={item.alertNumber}
      actions={
        <>
          <EmailReportButton onSend={(email) => report.mutateAsync(email)} />
          <ActionButtonGroup
            disabled={!isPending || decision.isPending}
            onBlock={() => decision.mutate('bloquear')}
            onRelease={() => decision.mutate('liberar')}
          />
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge label={SUPPLIER_CATEGORY_LABEL[item.category] ?? item.category} />
        <SeverityBadge severity={item.severity} />
        <StatusBadge status={item.status} />
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Fornecedor</dt>
          <dd className="text-foreground">{item.supplierName}</dd>
        </div>
        <div>
          <dt className="text-muted">CNPJ</dt>
          <dd className="text-foreground">{item.supplierCnpj}</dd>
        </div>
        <div>
          <dt className="text-muted">Confiança do modelo</dt>
          <dd className="text-foreground">{Math.round(Number(item.confidenceScore) * 100)}%</dd>
        </div>
      </dl>

      <div className="mt-6">
        <dt className="text-sm text-muted">Evidências</dt>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground">
          {item.evidence.map((evidence) => (
            <li key={evidence}>{evidence}</li>
          ))}
        </ul>
      </div>
    </DetailPageShell>
  );
}
