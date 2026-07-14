import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CategoryBadge } from '@/components/badges/CategoryBadge';
import { SeverityBadge } from '@/components/badges/SeverityBadge';
import { StatusBadge } from '@/components/badges/StatusBadge';

interface EntityListRowProps {
  to: string;
  title: string;
  categoryLabel: string;
  severity: string;
  status: string;
  date: string;
  leadingIcon?: LucideIcon;
  leadingIconColor?: string;
}

export function EntityListRow({ to, title, categoryLabel, severity, status, date, leadingIcon: LeadingIcon, leadingIconColor }: EntityListRowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-4 last:border-none sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        {LeadingIcon && <LeadingIcon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: leadingIconColor }} />}
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <CategoryBadge label={categoryLabel} />
            <SeverityBadge severity={severity} />
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end text-xs text-muted sm:self-auto">
        {date}
        <Link to={to} className="rounded-md p-1.5 text-muted hover:bg-surface-hover hover:text-foreground" aria-label="Ver detalhes">
          <Eye className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
