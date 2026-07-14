import { cn } from '@/lib/utils';

interface Tab {
  key: string;
  label: string;
}

interface ModuleTabsFilterProps {
  tabs: Tab[];
  value: string;
  onChange: (key: string) => void;
}

export function ModuleTabsFilter({ tabs, value, onChange }: ModuleTabsFilterProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-border bg-background p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            'rounded px-3 py-1.5 text-xs font-medium transition-colors',
            value === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
