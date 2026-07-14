import { PieChart, Pie, Cell } from 'recharts';

interface DonutChartProps {
  data: { key: string; label: string; value: number; color: string }[];
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-center gap-4">
      <PieChart width={130} height={130}>
        <Pie data={data} dataKey="value" nameKey="label" innerRadius={38} outerRadius={62} stroke="none">
          {data.map((entry) => (
            <Cell key={entry.key} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>

      <div className="flex-1 space-y-1.5 text-sm">
        {data.map((entry) => (
          <div key={entry.key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.label}
            </span>
            <span className="text-foreground">{total > 0 ? Math.round((entry.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
