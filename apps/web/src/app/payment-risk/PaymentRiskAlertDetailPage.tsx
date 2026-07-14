import { useParams } from 'react-router-dom';
import { MapPin, TriangleAlert } from 'lucide-react';
import { DetailPageShell } from '@/components/module-pattern/DetailPageShell';
import { SeverityBadge } from '@/components/badges/SeverityBadge';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { usePaymentTransactionDetail } from './api';

const RISK_TO_SEVERITY: Record<string, string> = { baixo: 'leve', medio: 'moderado', alto: 'grave' };

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR');
}

function formatDocument(doc: string | null) {
  if (!doc) return '—';
  return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function PaymentRiskAlertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading } = usePaymentTransactionDetail(id);

  if (isLoading || !item) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <p className="text-sm text-muted">Carregando...</p>
      </main>
    );
  }

  return (
    <DetailPageShell backTo="/payment-risk" title={formatCurrency(item.amount)} subtitle={item.externalRef}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs uppercase text-muted">{item.type}</span>
        <SeverityBadge severity={RISK_TO_SEVERITY[item.riskLevel] ?? 'leve'} />
        <StatusBadge status={item.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-muted">Dados do correntista</h3>
          <dl className="mt-2 space-y-2 text-sm">
            <div>
              <dt className="text-muted">Nome</dt>
              <dd className="text-foreground">{item.holderName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">CPF</dt>
              <dd className="text-foreground">{formatDocument(item.holderDocument)}</dd>
            </div>
            <div>
              <dt className="text-muted">E-mail</dt>
              <dd className="text-foreground">{item.holderEmail ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">Idade da conta</dt>
              <dd className="text-foreground">{item.accountAgeDays} dias</dd>
            </div>
            <div>
              <dt className="text-muted">Conta de destino</dt>
              <dd className="text-foreground">{item.destination ?? '—'}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted">
            <MapPin className="h-4 w-4" />
            Localização da transação
          </h3>
          <dl className="mt-2 space-y-2 text-sm">
            <div>
              <dt className="text-muted">Cidade / Estado</dt>
              <dd className="text-foreground">
                {item.originCity ?? '—'}, {item.originState ?? '—'} — {item.originCountry ?? 'BR'}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Endereço IP</dt>
              <dd className="text-foreground">{item.originIp ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">Data/hora</dt>
              <dd className="text-foreground">{formatDateTime(item.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {item.threatDescription && (
        <div className="mt-6 rounded-md border border-status-critical/30 bg-status-critical/5 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-status-critical">
            <TriangleAlert className="h-4 w-4" />
            Descrição da ameaça
          </h3>
          <p className="mt-2 text-sm text-foreground">{item.threatDescription}</p>
        </div>
      )}
    </DetailPageShell>
  );
}
