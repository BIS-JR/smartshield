import { useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { DetailPageShell } from '@/components/module-pattern/DetailPageShell';
import { ActionButtonGroup } from '@/components/module-pattern/ActionButtonGroup';
import { CategoryBadge, DOCUMENT_CATEGORY_LABEL } from '@/components/badges/CategoryBadge';
import { SeverityBadge } from '@/components/badges/SeverityBadge';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { useDocumentAiDetail, useDocumentAiDecision } from './api';

export function DocumentAiDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading } = useDocumentAiDetail(id);
  const decision = useDocumentAiDecision(id!);

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
      backTo="/document-ai"
      title={item.title}
      subtitle={item.caseNumber}
      actions={
        <ActionButtonGroup
          disabled={!isPending || decision.isPending}
          onBlock={() => decision.mutate('bloquear')}
          onRelease={() => decision.mutate('liberar')}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge label={DOCUMENT_CATEGORY_LABEL[item.category] ?? item.category} />
        <SeverityBadge severity={item.severity} />
        <StatusBadge status={item.status} />
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Solicitante</dt>
          <dd className="text-foreground">{item.requesterName}</dd>
        </div>
        <div>
          <dt className="text-muted">E-mail</dt>
          <dd className="text-foreground">{item.requesterEmail}</dd>
        </div>
        <div>
          <dt className="text-muted">CPF</dt>
          <dd className="text-foreground">{item.requesterCpf}</dd>
        </div>
        <div>
          <dt className="text-muted">Confiança do modelo</dt>
          <dd className="text-foreground">{Math.round(Number(item.confidenceScore) * 100)}%</dd>
        </div>
      </dl>

      <div className="mt-6">
        <dt className="text-sm text-muted">Motivo da suspeita</dt>
        <dd className="mt-1 text-sm text-foreground">{item.fraudReason}</dd>
      </div>

      {item.documentUrl && (
        <a
          href={item.documentUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <FileText className="h-4 w-4" />
          Ver documento
        </a>
      )}

      {decision.isError && <p className="mt-4 text-sm text-status-critical">Não foi possível registrar a decisão.</p>}
    </DetailPageShell>
  );
}
