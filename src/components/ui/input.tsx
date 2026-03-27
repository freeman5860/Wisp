import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border bg-background-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 focus-visible:border-border-bright',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-mood-anxious' : 'border-border',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-mood-anxious">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input, type InputProps };
