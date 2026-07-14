import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = {
  aprovado: 'APROVADO',
  rejeitado: 'REJEITADO',
  aguardando: 'AGUARDANDO',
};

const STATUS_CLASS: Record<string, string> = {
  aprovado: 'bg-status-good/15 text-status-good',
  rejeitado: 'bg-status-critical/15 text-status-critical',
  aguardando: 'bg-status-info/15 text-status-info',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_CLASS[status])}>
      {STATUS_LABEL[status] ?? status.toUpperCase()}
    </span>
  );
}
