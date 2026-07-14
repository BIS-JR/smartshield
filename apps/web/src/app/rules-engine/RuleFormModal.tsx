import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateRule, useUpdateRule, type RuleDto, type RuleFormInput } from './api';

const MODULE_OPTIONS = [
  { key: 'document_ai', label: 'Document AI' },
  { key: 'corporate_fraud', label: 'Corporate Fraud' },
  { key: 'payment_risk', label: 'Payment Risk' },
  { key: 'supplier_intelligence', label: 'Supplier Intelligence' },
  { key: 'investigation', label: 'Investigation' },
];

interface RuleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: RuleDto | null;
}

export function RuleFormModal({ open, onOpenChange, rule }: RuleFormModalProps) {
  const isEdit = Boolean(rule);
  const create = useCreateRule();
  const update = useUpdateRule();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RuleFormInput>();

  useEffect(() => {
    if (open) {
      reset(
        rule
          ? {
              name: rule.name,
              moduleKey: rule.module.key,
              description: rule.description ?? '',
              conditionExpression: rule.conditionExpression,
              threshold: rule.threshold ? Number(rule.threshold) : undefined,
              outputSeverity: rule.outputSeverity,
              action: rule.action,
            }
          : { moduleKey: 'document_ai', outputSeverity: 'moderado', action: 'revisar' },
      );
    }
  }, [open, rule, reset]);

  async function onSubmit(input: RuleFormInput) {
    const payload = { ...input, threshold: input.threshold ? Number(input.threshold) : undefined };
    if (isEdit && rule) {
      await update.mutateAsync({ id: rule.id, input: payload });
    } else {
      await create.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const submitting = create.isPending || update.isPending;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-6 outline-none max-h-[90vh] overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-foreground">{isEdit ? 'Editar Regra' : 'Nova Regra'}</Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-muted hover:bg-surface-hover hover:text-foreground">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register('name', { required: true })} />
              {errors.name && <p className="text-xs text-status-critical">Informe um nome</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="moduleKey">Módulo</Label>
              <select
                id="moduleKey"
                {...register('moduleKey', { required: true })}
                className="h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
              >
                {MODULE_OPTIONS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" {...register('description')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="conditionExpression">Condição</Label>
              <Input id="conditionExpression" placeholder="amount > threshold" className="font-mono" {...register('conditionExpression', { required: true })} />
              {errors.conditionExpression && <p className="text-xs text-status-critical">Informe a condição</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="threshold">Threshold</Label>
              <Input id="threshold" type="number" step="any" {...register('threshold', { valueAsNumber: true })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="outputSeverity">Severidade de saída</Label>
                <select
                  id="outputSeverity"
                  {...register('outputSeverity', { required: true })}
                  className="h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
                >
                  <option value="leve">Leve</option>
                  <option value="moderado">Moderado</option>
                  <option value="grave">Grave</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="action">Ação</Label>
                <select
                  id="action"
                  {...register('action', { required: true })}
                  className="h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
                >
                  <option value="alertar">Alertar</option>
                  <option value="revisar">Revisar</option>
                  <option value="bloquear">Bloquear</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar regra'}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
