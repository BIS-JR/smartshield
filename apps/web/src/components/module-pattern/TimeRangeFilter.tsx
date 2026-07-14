import { cn } from '@/lib/utils';

const RANGES = ['1h', '12h', '24h', '60h'] as const;
export type TimeRange = (typeof RANGES)[number];

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
          {range}
        </button>
      ))}
    </div>
  );
}
