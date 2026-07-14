import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useModules } from '@/lib/useModules';

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  const { data: modules } = useModules();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-6 outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-foreground">Sobre o Produto</Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-muted hover:bg-surface-hover hover:text-foreground">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground">Fraud Intelligence Platform</p>
            <p className="text-muted">Plataforma integrada de proteção antifraude desenvolvida pela Smart System.</p>
            <p className="text-muted">
              <span className="text-foreground">Versão:</span> 2.1.0
            </p>
            <p className="text-muted">
              <span className="text-foreground">Build:</span> 2026.07.14-stable
            </p>
            <p className="text-muted">
              <span className="text-foreground">Módulos:</span>{' '}
              {modules?.map((m) => m.name).join(', ') ?? 'carregando...'}.
            </p>
          </div>

          <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
            © 2026 Smart System. Todos os direitos reservados.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
