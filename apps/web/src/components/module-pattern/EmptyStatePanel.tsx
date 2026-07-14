import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStatePanelProps {
  icon: LucideIcon;
  message: string;
  children?: ReactNode;
}

export function EmptyStatePanel({ icon: Icon, message, children }: EmptyStatePanelProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <Icon className="h-10 w-10 text-muted" />
      <p className="max-w-xs text-sm text-muted">{message}</p>
      {children}
    </div>
  );
}
