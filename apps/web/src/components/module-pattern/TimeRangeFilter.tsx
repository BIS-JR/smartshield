import { cn } from '@/lib/utils';

const RANGES = ['1h', '12h', '24h', '60h', 'all'] as const;
export type TimeRange = (typeof RANGES)[number];

const RANGE_LABEL: Record<TimeRange, string> = {
  '1h': '1h',
  '12h': '12h',
  '24h': '24h',
  '60h': '60h',
  all: 'Todos',
};

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  return (
    <div className="inline-flex rounded-md border border-border bg-background p-1">
      {RANGES.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onChange(range)}
          className={cn(
            'rounded px-3 py-1 text-xs font-medium transition-colors',
            value === range ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-foreground',
          )}
        >
          {RANGE_LABEL[range]}
        </button>
      ))}
    </div>
  );
}
