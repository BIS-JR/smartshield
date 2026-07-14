import { LogIn, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuthCardShellProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCardShell({ title, subtitle, icon, children, footer }: AuthCardShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Smart System
      </div>

      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-glow shadow-primary/40">
        {icon ?? <LogIn className="h-6 w-6 text-primary-foreground" />}
      </div>

      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>

      <div className="mt-8 w-full max-w-sm rounded-lg border border-border bg-surface p-6">{children}</div>

      {footer && <div className="mt-6 text-sm text-muted">{footer}</div>}
    </div>
  );
}
