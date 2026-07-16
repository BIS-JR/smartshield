import { LogIn } from 'lucide-react';
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
      <div className="mb-6 grid w-full max-w-sm grid-cols-3 items-center justify-items-center">
        <img src="/logos/smart-system.png" alt="Smart System" className="h-11 w-auto" />

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-glow shadow-primary/40">
          {icon ?? <LogIn className="h-6 w-6 text-primary-foreground" />}
        </div>

        <img src="/logos/smart-shield.png" alt="SmartShield" className="h-14 w-auto" />
      </div>

      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>

      <div className="mt-8 w-full max-w-sm rounded-lg border border-border bg-surface p-6">{children}</div>

      {footer && <div className="mt-6 text-sm text-muted">{footer}</div>}
    </div>
  );
}
