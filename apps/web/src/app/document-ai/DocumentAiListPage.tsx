import { useState } from 'react';
import { FileSearch } from 'lucide-react';
import { ModuleListPage } from '@/components/module-pattern/ModuleListPage';
import type { TimeRange } from '@/components/module-pattern/TimeRangeFilter';
import { DOCUMENT_CATEGORY_LABEL } from '@/components/badges/CategoryBadge';
import { useDocumentAiList, type DocumentCase } from './api';
import { useModules } from '@/lib/useModules';

function formatDate(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function DocumentAiListPage() {
  const [range, setRange] = useState<TimeRange>('24h');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const { data: modules } = useModules();
  const module = modules?.find((m) => m.key === 'document_ai');
  const { data, isLoading } = useDocumentAiList(range, page, pageSize);

  return (
    <ModuleListPage<DocumentCase>
      icon={FileSearch}
      iconColor={module?.color ?? '#3987e5'}
      title="Document AI Engine"
      subtitle="Análise inteligente de documentos"
      range={range}
      onRangeChange={(r) => {
        setRange(r);
        setPage(1);
      }}
      pageSize={pageSize}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
      page={page}
      onPageChange={setPage}
      total={data?.total ?? 0}
      counts={data?.counts}
      chart="donut"
      items={data?.items}
      isLoading={isLoading}
      listLabel="Incidências"
      renderRow={(item) => ({
        key: item.id,
        to: `/document-ai/${item.id}`,
        title: item.title,
        categoryLabel: DOCUMENT_CATEGORY_LABEL[item.category] ?? item.category,
        severity: item.severity,
        status: item.status,
        date: formatDate(item.createdAt),
      })}
    />
  );
}
