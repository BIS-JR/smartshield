import { cn } from '@/lib/utils';

const SEVERITY_LABEL: Record<string, string> = {
  leve: 'LEVE',
  moderado: 'MODERADO',
  grave: 'GRAVE',
};

const SEVERITY_CLASS: Record<string, string> = {
  leve: 'bg-status-warning/15 text-status-warning',
  moderado: 'bg-status-serious/15 text-status-serious',
  grave: 'bg-status-critical/15 text-status-critical',
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', SEVERITY_CLASS[severity])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {SEVERITY_LABEL[severity] ?? severity.toUpperCase()}
    </span>
  );
}
