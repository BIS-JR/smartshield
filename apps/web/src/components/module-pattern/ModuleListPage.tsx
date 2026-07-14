import type { LucideIcon } from 'lucide-react';
import { TimeRangeFilter, type TimeRange } from './TimeRangeFilter';
import { PageSizeSelector } from './PageSizeSelector';
import { TriChartSummary } from './TriChartSummary';
import { EntityListRow } from './EntityListRow';
import type { StatusCounts } from '@/lib/useModules';

interface ModuleListPageProps<T> {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  subtitle: string;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  total: number;
  counts?: StatusCounts;
  chart: 'donut' | 'bar';
  items?: T[];
  isLoading: boolean;
  listLabel: string;
  renderRow: (item: T) => { key: string; to: string; title: string; categoryLabel: string; severity: string; status: string; date: string };
}

export function ModuleListPage<T>({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  range,
  onRangeChange,
  pageSize,
  onPageSizeChange,
  page,
  onPageChange,
  total,
  counts,
  chart,
  items,
  isLoading,
  listLabel,
  renderRow,
}: ModuleListPageProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted">{subtitle}</p>
          </div>
        </div>
        <TimeRangeFilter value={range} onChange={onRangeChange} />
      </div>

      {counts && (
        <div className="mt-6">
          <TriChartSummary counts={counts} chart={chart} />
        </div>
      )}

      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-foreground">
            {listLabel} ({total})
          </h2>
          <PageSizeSelector value={pageSize} onChange={onPageSizeChange} />
        </div>

        <div className="mt-3">
          {isLoading && <p className="py-6 text-sm text-muted">Carregando...</p>}
          {!isLoading && items?.length === 0 && <p className="py-6 text-sm text-muted">Nenhum registro encontrado.</p>}
          {items?.map((item) => {
            const row = renderRow(item);
            return <EntityListRow key={row.key} {...row} />;
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-xs text-muted">
            <span>
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="rounded-md border border-border px-3 py-1 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="rounded-md border border-border px-3 py-1 disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
