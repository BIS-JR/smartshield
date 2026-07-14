import { ShieldAlert, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SeverityBadge } from '@/components/badges/SeverityBadge';
import type { BlockDto } from './api';

const STATUS_ICON = {
  ativo: ShieldAlert,
  em_analise: Clock,
  liberado: ShieldCheck,
} as const;

const STATUS_ICON_COLOR = {
  ativo: 'var(--status-critical)',
  em_analise: 'var(--status-warning)',
  liberado: 'var(--status-good)',
} as const;

const STATUS_LABEL = {
  ativo: 'ATIVO',
  em_analise: 'EM ANÁLISE',
  liberado: 'LIBERADO',
} as const;

const STATUS_BADGE_CLASS = {
  ativo: 'bg-status-critical/15 text-status-critical',
  em_analise: 'bg-status-warning/15 text-status-warning',
  liberado: 'bg-status-good/15 text-status-good',
} as const;

interface BlockCardProps {
  block: BlockDto;
  selected: boolean;
  onClick: () => void;
}

export function BlockCard({ block, selected, onClick }: BlockCardProps) {
  const Icon = STATUS_ICON[block.status];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-md border p-3 text-left transition-colors',
        selected ? 'border-primary bg-surface-hover' : 'border-border bg-surface hover:border-primary/50',
      )}
    >
      <div className="flex items-center gap-2 text-xs">
        <Icon className="h-4 w-4" style={{ color: STATUS_ICON_COLOR[block.status] }} />
        <span className="font-mono text-primary">{block.code}</span>
        <SeverityBadge severity={block.severity} />
      </div>
      <p className="mt-1.5 text-sm font-medium text-foreground">{block.title}</p>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        <span className="text-muted">{block.sourceModule?.name}</span>
        <span className={cn('rounded-full px-2 py-0.5 font-semibold', STATUS_BADGE_CLASS[block.status])}>
          {STATUS_LABEL[block.status]}
        </span>
      </div>
    </button>
  );
}
