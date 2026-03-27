import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md bg-background-hover animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-background-hover via-border/30 to-background-hover',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
