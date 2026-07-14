function riskColor(percentage: number) {
  if (percentage >= 60) return 'var(--status-critical)';
  if (percentage >= 30) return 'var(--status-warning)';
  return 'var(--status-good)';
}

interface RiskBarProps {
  label: string;
  percentage: number;
  incidentCount: number;
}

export function RiskBar({ label, percentage, incidentCount }: RiskBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-xs font-medium text-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(percentage, 3)}%`, backgroundColor: riskColor(percentage) }}
        />
      </div>
      <span className="w-10 text-right text-xs text-muted">{percentage}%</span>
      <span className="w-16 text-right text-xs text-muted">{incidentCount} inc.</span>
    </div>
  );
}
