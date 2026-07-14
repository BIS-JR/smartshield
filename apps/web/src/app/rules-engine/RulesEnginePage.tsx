import { useState } from 'react';
import { Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModuleTabsFilter } from '@/components/module-pattern/ModuleTabsFilter';
import { useRules, type RuleDto } from './api';
import { RuleCard } from './RuleCard';
import { RuleFormModal } from './RuleFormModal';
import { useModules } from '@/lib/useModules';

const TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'document_ai', label: 'Document AI' },
  { key: 'corporate_fraud', label: 'Corporate Fraud' },
  { key: 'payment_risk', label: 'Payment Risk' },
  { key: 'supplier_intelligence', label: 'Supplier Intelligence' },
  { key: 'investigation', label: 'Investigation' },
];

export function RulesEnginePage() {
  const [tab, setTab] = useState('all');
  const { data: modules } = useModules();
  const module = modules?.find((m) => m.key === 'rules_engine');
  const { data: rules, isLoading } = useRules(tab);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleDto | null>(null);

  function openCreate() {
    setEditingRule(null);
    setModalOpen(true);
  }

  function openEdit(rule: RuleDto) {
    setEditingRule(rule);
    setModalOpen(true);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" style={{ color: module?.color ?? '#a86b1f' }} />
          <div>
            <h1 className="text-xl font-semibold text-foreground">Rules Engine</h1>
            <p className="text-sm text-muted">Editor de regras de detecção de fraude</p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova Regra
        </Button>
      </div>

      <div className="mt-6">
        <ModuleTabsFilter tabs={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-sm text-muted">Carregando...</p>}
        {!isLoading && rules?.length === 0 && <p className="text-sm text-muted">Nenhuma regra encontrada para este filtro.</p>}
        {rules?.map((rule) => (
          <RuleCard key={rule.id} rule={rule} onEdit={() => openEdit(rule)} />
        ))}
      </div>

      <RuleFormModal open={modalOpen} onOpenChange={setModalOpen} rule={editingRule} />
    </main>
  );
}
