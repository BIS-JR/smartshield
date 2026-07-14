import { useState } from 'react';
import { Power, Pencil, Trash2, FlaskConical } from 'lucide-react';
import { SeverityBadge } from '@/components/badges/SeverityBadge';
import { cn } from '@/lib/utils';
import { useSetRuleActive, useDeleteRule, useTestRule, type RuleDto } from './api';
import { ConfirmDialog } from '@/components/module-pattern/ConfirmDialog';

const ACTION_LABEL: Record<string, string> = { bloquear: 'bloquear', revisar: 'revisar', alertar: 'alertar' };
const ACTION_CLASS: Record<string, string> = {
  bloquear: 'bg-status-critical/15 text-status-critical',
  revisar: 'bg-status-serious/15 text-status-serious',
  alertar: 'bg-status-info/15 text-status-info',
};

interface RuleCardProps {
  rule: RuleDto;
  onEdit: () => void;
}

export function RuleCard({ rule, onEdit }: RuleCardProps) {
  const setActive = useSetRuleActive();
  const deleteRule = useDeleteRule();
  const testRule = useTestRule();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  return (
    <div className={cn('rounded-lg border border-border bg-surface p-4', !rule.isActive && 'opacity-50')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-foreground">{rule.name}</h3>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">{rule.module.name}</span>
            <SeverityBadge severity={rule.outputSeverity} />
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', ACTION_CLASS[rule.action])}>{ACTION_LABEL[rule.action]}</span>
          </div>
          {rule.description && <p className="mt-1.5 text-sm text-muted">{rule.description}</p>}
          <p className="mt-2 font-mono text-xs text-muted">
            Condição: <span className="text-foreground">{rule.conditionExpression}</span>
            {rule.threshold && (
              <>
                {' '}
                Threshold: <span className="text-foreground">{rule.threshold}</span>
              </>
            )}
          </p>
          {testResult && <p className="mt-2 text-xs text-primary">{testResult}</p>}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Testar regra contra dados reais"
            onClick={async () => {
              const result = await testRule.mutateAsync(rule.id);
              setTestResult(`${result.matched} de ${result.evaluated} registros bateram com esta condição.`);
            }}
            className="rounded-md p-1.5 text-muted hover:bg-surface-hover hover:text-primary"
          >
            <FlaskConical className="h-4 w-4" />
          </button>
          <button
            type="button"
            title={rule.isActive ? 'Desativar' : 'Ativar'}
            onClick={() => setActive.mutate({ id: rule.id, isActive: !rule.isActive })}
            className={cn('rounded-md p-1.5 hover:bg-surface-hover', rule.isActive ? 'text-status-good' : 'text-muted')}
          >
            <Power className="h-4 w-4" />
          </button>
          <button type="button" title="Editar" onClick={onEdit} className="rounded-md p-1.5 text-muted hover:bg-surface-hover hover:text-foreground">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Excluir"
            onClick={() => setConfirmOpen(true)}
            className="rounded-md p-1.5 text-status-critical hover:bg-surface-hover"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir regra"
        description={`Tem certeza que deseja excluir "${rule.name}"? Esta ação não pode ser desfeita.`}
        confirming={deleteRule.isPending}
        onConfirm={() => deleteRule.mutate(rule.id, { onSuccess: () => setConfirmOpen(false) })}
      />
    </div>
  );
}
