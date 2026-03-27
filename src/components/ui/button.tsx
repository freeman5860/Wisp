import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'mood';
  size?: 'sm' | 'md' | 'lg';
  moodColor?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', moodColor, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-accent text-background hover:bg-accent-hover shadow-glow':
              variant === 'primary',
            'bg-background-raised text-text-primary border border-border hover:bg-background-hover hover:border-border-bright':
              variant === 'secondary',
            'text-text-secondary hover:text-text-primary hover:bg-background-hover':
              variant === 'ghost',
          },
          {
            'h-8 px-3 text-sm rounded-sm': size === 'sm',
            'h-10 px-5 text-sm rounded-md': size === 'md',
            'h-12 px-8 text-base rounded-md': size === 'lg',
          },
          className
        )}
        style={
          variant === 'mood' && moodColor
            ? {
                backgroundColor: `${moodColor}20`,
                color: moodColor,
                borderColor: `${moodColor}40`,
              }
            : undefined
        }
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, type ButtonProps };
