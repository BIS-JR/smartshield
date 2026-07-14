import type { ReactNode } from 'react';

export function ChartCardShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
