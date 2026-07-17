import { useState } from 'react';
import { GitBranch } from 'lucide-react';
import { ModuleListPage } from '@/components/module-pattern/ModuleListPage';
import type { TimeRange } from '@/components/module-pattern/TimeRangeFilter';
import { CORPORATE_CATEGORY_LABEL } from '@/components/badges/CorporateCategoryLabel';
import { useCorporateFraudList, type CorporateEntity } from './api';
import { useModules } from '@/lib/useModules';

function formatDate(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CorporateFraudListPage() {
  const [range, setRange] = useState<TimeRange>('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const { data: modules } = useModules();
  const module = modules?.find((m) => m.key === 'corporate_fraud');
  const { data, isLoading } = useCorporateFraudList(range, page, pageSize);

  return (
    <ModuleListPage<CorporateEntity>
      icon={GitBranch}
      iconColor={module?.color ?? '#9085e9'}
      title="Corporate Fraud Graph"
      subtitle="Análise de redes de relacionamento"
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
      chart="bar"
      items={data?.items}
      isLoading={isLoading}
      listLabel="Incidências"
      renderRow={(item) => ({
        key: item.id,
        to: `/corporate-fraud/${item.id}`,
        title: item.title,
        categoryLabel: CORPORATE_CATEGORY_LABEL[item.category] ?? item.category,
        severity: item.severity,
        status: item.status,
        date: formatDate(item.createdAt),
      })}
    />
  );
}
