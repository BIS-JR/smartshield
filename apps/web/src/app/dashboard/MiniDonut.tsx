import { PieChart, Pie, Cell } from 'recharts';
import type { StatusCounts } from '@/lib/useModules';

const COLORS = {
  aprovado: 'var(--status-good)',
  rejeitado: 'var(--status-critical)',
  aguardando: 'var(--status-info)',
};

export function MiniDonut({ counts }: { counts: StatusCounts }) {
  const data = [
    { key: 'aprovado', value: counts.aprovado },
    { key: 'rejeitado', value: counts.rejeitado },
    { key: 'aguardando', value: counts.aguardando },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <div className="h-14 w-14 rounded-full border-4 border-border" />;
  }

  return (
    <PieChart width={56} height={56}>
      <Pie data={data} dataKey="value" innerRadius={16} outerRadius={26} stroke="none">
        {data.map((entry) => (
          <Cell key={entry.key} fill={COLORS[entry.key as keyof typeof COLORS]} />
        ))}
      </Pie>
    </PieChart>
  );
}
