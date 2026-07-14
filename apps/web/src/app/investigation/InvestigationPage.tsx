import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useBlocks } from './api';
import { BlockCard } from './BlockCard';
import { ChatPanel } from './ChatPanel';

export function InvestigationPage() {
  const { data: blocks, isLoading } = useBlocks();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedBlock = blocks?.find((b) => b.id === selectedId) ?? null;

  return (
    <main className="mx-auto flex h-[calc(100vh-4rem)] max-w-6xl flex-col px-4 py-6 sm:px-8">
      <div className="mb-4 flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-module-investigation" />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Investigation Assistant</h1>
          <p className="text-sm text-muted">Selecione um bloqueio para análise automática</p>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <div className="flex min-h-0 flex-col rounded-lg border border-border bg-surface p-3">
          <p className="mb-2 px-1 text-xs font-medium text-muted">Bloqueios ({blocks?.length ?? 0})</p>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {isLoading && <p className="p-2 text-sm text-muted">Carregando...</p>}
            {blocks?.map((block) => (
              <BlockCard key={block.id} block={block} selected={block.id === selectedId} onClick={() => setSelectedId(block.id)} />
            ))}
          </div>
        </div>

        <div className="min-h-0 overflow-hidden rounded-lg border border-border bg-surface">
          <ChatPanel block={selectedBlock} />
        </div>
      </div>
    </main>
  );
}
