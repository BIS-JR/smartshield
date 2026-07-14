import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  amount: string;
  description: string | null;
  createdAt: string;
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface RecentAlertsListProps {
  alerts: Alert[];
  detailPathPrefix: string;
}

export function RecentAlertsList({ alerts, detailPathPrefix }: RecentAlertsListProps) {
  if (alerts.length === 0) {
    return <p className="py-6 text-sm text-muted">Nenhum alerta recente.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {alerts.map((alert) => (
        <Link
          key={alert.id}
          to={`${detailPathPrefix}/${alert.id}`}
          className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-surface-hover"
        >
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-status-critical" />
            <span className="rounded-full border border-border px-2 py-0.5 text-xs uppercase text-muted">{alert.type}</span>
            <div>
              <p className="text-sm font-medium text-foreground">{formatCurrency(alert.amount)}</p>
              <p className="text-xs text-muted">{alert.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            {formatTime(alert.createdAt)}
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>
      ))}
    </div>
  );
}
