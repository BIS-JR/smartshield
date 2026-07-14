import { cn } from '@/lib/utils';

const SIZES = [5, 10, 25] as const;

interface PageSizeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function PageSizeSelector({ value, onChange }: PageSizeSelectorProps) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-muted">
      Exibir:
      <div className="inline-flex rounded-md border border-border bg-background p-1">
        {SIZES.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            className={cn(
              'rounded px-2.5 py-1 font-medium transition-colors',
              value === size ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-foreground',
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
