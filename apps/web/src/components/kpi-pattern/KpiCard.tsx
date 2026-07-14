import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  iconColor: string;
  value: string;
  label: string;
}

export function KpiCard({ icon: Icon, iconColor, value, label }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <Icon className="h-5 w-5" style={{ color: iconColor }} />
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
