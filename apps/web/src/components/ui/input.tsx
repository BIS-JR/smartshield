import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, icon, ...props }, ref) => {
  if (icon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
        <input
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary',
            className,
          )}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary',
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';
