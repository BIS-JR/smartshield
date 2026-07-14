import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { FileText, History, Share2, Sparkles, Send, ShieldCheck, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyStatePanel } from '@/components/module-pattern/EmptyStatePanel';
import { useBriefing, useMessages, useAskQuestion, useUnblock, type BlockDto } from './api';

const TABS = [
  { key: 'evidencias', label: 'Evidências', icon: FileText },
  { key: 'historico', label: 'Histórico', icon: History },
  { key: 'conexoes', label: 'Conexões', icon: Share2 },
  { key: 'decisao', label: 'Decisão IA', icon: Sparkles },
] as const;

export function ChatPanel({ block }: { block: BlockDto | null }) {
  const [tab, setTab] = useState<string>('evidencias');
  const [question, setQuestion] = useState('');

  const { data: briefing, isLoading: briefingLoading } = useBriefing(block?.id);
  const { data: messages } = useMessages(block?.id);
  const ask = useAskQuestion(block?.id ?? '');
  const unblock = useUnblock(block?.id ?? '');

  if (!block) {
    return (
      <EmptyStatePanel icon={TriangleAlert} message="Selecione um bloqueio na lista para análise automática completa">
        <div className="mt-2 grid grid-cols-2 gap-2">
          {TABS.map((t) => (
            <div key={t.key} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs text-muted">
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </div>
          ))}
        </div>
      </EmptyStatePanel>
    );
  }

  function handleAsk() {
    if (!question.trim()) return;
    ask.mutate(question);
    setQuestion('');
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <p className="font-mono text-xs text-primary">{block.code}</p>
        <h2 className="font-semibold text-foreground">{block.title}</h2>
      </div>

      <Tabs.Root value={tab} onValueChange={setTab} className="border-b border-border">
        <Tabs.List className="flex gap-1 px-3 pt-2">
          {TABS.map((t) => (
            <Tabs.Trigger
              key={t.key}
              value={t.key}
              className={cn(
                'flex items-center gap-1.5 rounded-t-md px-3 py-2 text-xs font-medium text-muted data-[state=active]:bg-surface-hover data-[state=active]:text-foreground',
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      <div className="max-h-48 overflow-y-auto border-b border-border p-4 text-sm">
        {briefingLoading && <p className="text-muted">Gerando análise automática...</p>}
        {briefing && tab === 'evidencias' && (
          <ul className="list-inside list-disc space-y-1 text-foreground">
            {briefing.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        {briefing && tab === 'historico' && (
          <ul className="space-y-1 text-foreground">
            {briefing.history.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
        {briefing && tab === 'conexoes' && (
          <ul className="list-inside list-disc space-y-1 text-foreground">
            {briefing.connections.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
        {briefing && tab === 'decisao' && (
          <div className="space-y-2 text-foreground">
            <p>{briefing.decisionExplanation}</p>
            <p className="font-medium text-primary">{briefing.recommendation}</p>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages?.map((m) => (
          <div key={m.id} className={cn('max-w-[85%] rounded-lg p-3 text-sm', m.sender === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-surface-hover text-foreground')}>
            <p className="whitespace-pre-line">{m.content}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <Input
          placeholder="Faça uma pergunta sobre este bloqueio..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
        />
        <Button size="icon" onClick={handleAsk} disabled={ask.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {block.status !== 'liberado' && (
        <div className="border-t border-border p-3">
          <Button variant="outline" className="w-full" onClick={() => unblock.mutate()} disabled={unblock.isPending}>
            <ShieldCheck className="h-4 w-4" />
            {unblock.isPending ? 'Desbloqueando...' : 'Desbloquear'}
          </Button>
        </div>
      )}
    </div>
  );
}
