import { PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import type { StatusCounts } from '@/lib/useModules';

const COLORS: Record<keyof StatusCounts, string> = {
  aprovado: 'var(--status-good)',
  rejeitado: 'var(--status-critical)',
  aguardando: 'var(--status-info)',
};

const LABELS: Record<keyof StatusCounts, string> = {
  aprovado: 'Aprovados',
  rejeitado: 'Rejeitados',
  aguardando: 'Aguardando',
};

interface SummaryCardProps {
  title: string;
  counts: StatusCounts;
  chart: 'donut' | 'bar';
}

export function SummaryCard({ title, counts, chart }: SummaryCardProps) {
  const total = counts.aprovado + counts.rejeitado + counts.aguardando;
  const data = (Object.keys(counts) as (keyof StatusCounts)[]).map((key) => ({ key, value: counts[key] }));
  const chartData = data.filter((d) => d.value > 0);

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-medium text-muted">{title}</h3>

      <div className="mt-4 flex items-center gap-4">
        {chart === 'donut' ? (
          chartData.length > 0 ? (
            <PieChart width={80} height={80}>
              <Pie data={chartData} dataKey="value" innerRadius={22} outerRadius={38} stroke="none">
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={COLORS[entry.key]} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <div className="h-20 w-20 rounded-full border-8 border-border" />
          )
        ) : (
          <BarChart width={80} height={80} data={data} barCategoryGap={6}>
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={COLORS[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        )}

        <div className="flex-1 space-y-1 text-xs">
          {data.map((entry) => (
            <div key={entry.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[entry.key] }} />
                {LABELS[entry.key]}
              </span>
              <span className="text-foreground">{entry.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 border-t border-border pt-1 font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
