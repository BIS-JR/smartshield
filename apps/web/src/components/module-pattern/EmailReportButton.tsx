import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailReportButtonProps {
  label?: string;
  onSend: (email: string) => Promise<unknown>;
}

export function EmailReportButton({ label = 'Enviar relatório por e-mail', onSend }: EmailReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      await onSend(email);
      setSent(true);
    } catch {
      setError('Não foi possível enviar o relatório.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setEmail('');
          setSent(false);
          setError(null);
        }
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4" />
          {label}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-6 outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-foreground">{label}</Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-muted hover:bg-surface-hover hover:text-foreground">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {sent ? (
            <p className="text-sm text-status-good">Relatório enviado para {email}.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="report-email">E-mail do destinatário</Label>
                <Input
                  id="report-email"
                  type="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-xs text-status-critical">{error}</p>}
              <Button className="w-full" disabled={!email || sending} onClick={handleSend}>
                {sending ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
