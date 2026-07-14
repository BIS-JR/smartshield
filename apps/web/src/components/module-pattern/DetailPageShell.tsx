import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface DetailPageShellProps {
  backTo: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DetailPageShell({ backTo, title, subtitle, actions, children }: DetailPageShellProps) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface p-6">{children}</div>
    </main>
  );
}
