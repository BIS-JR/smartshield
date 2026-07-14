import { useState } from 'react';
import { Truck, Flame, TriangleAlert } from 'lucide-react';
import { ModuleListPage } from '@/components/module-pattern/ModuleListPage';
import type { TimeRange } from '@/components/module-pattern/TimeRangeFilter';
import { SUPPLIER_CATEGORY_LABEL } from '@/components/badges/SupplierCategoryLabel';
import { useSupplierIntelligenceList, type SupplierAlert } from './api';
import { useModules } from '@/lib/useModules';

function formatDate(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function SupplierIntelligenceListPage() {
  const [range, setRange] = useState<TimeRange>('24h');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const { data: modules } = useModules();
  const module = modules?.find((m) => m.key === 'supplier_intelligence');
  const { data, isLoading } = useSupplierIntelligenceList(range, page, pageSize);

  return (
    <ModuleListPage<SupplierAlert>
      icon={Truck}
      iconColor={module?.color ?? '#d95926'}
      title="Supplier Intelligence"
      subtitle="Análise de fornecedores e cadeia de suprimentos"
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
      listLabel="Alertas"
      renderRow={(item) => ({
        key: item.id,
        to: `/supplier-intelligence/${item.id}`,
        title: item.description,
        categoryLabel: SUPPLIER_CATEGORY_LABEL[item.category] ?? item.category,
        severity: item.severity,
        status: item.status,
        date: formatDate(item.createdAt),
        leadingIcon: item.severity === 'grave' ? Flame : TriangleAlert,
        leadingIconColor: item.severity === 'grave' ? 'var(--status-critical)' : 'var(--status-warning)',
      })}
    />
  );
}
