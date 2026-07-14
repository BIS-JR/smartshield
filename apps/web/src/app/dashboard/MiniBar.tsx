import { BarChart, Bar, Cell } from 'recharts';
import type { StatusCounts } from '@/lib/useModules';

const COLORS = {
  aprovado: 'var(--status-good)',
  rejeitado: 'var(--status-critical)',
  aguardando: 'var(--status-info)',
};

export function MiniBar({ counts }: { counts: StatusCounts }) {
  const data = [
    { key: 'aprovado', value: counts.aprovado },
    { key: 'rejeitado', value: counts.rejeitado },
    { key: 'aguardando', value: counts.aguardando },
  ];

  return (
    <BarChart width={56} height={56} data={data} barCategoryGap={4}>
      <Bar dataKey="value" radius={[2, 2, 0, 0]}>
        {data.map((entry) => (
          <Cell key={entry.key} fill={COLORS[entry.key as keyof typeof COLORS]} />
        ))}
      </Bar>
    </BarChart>
  );
}
