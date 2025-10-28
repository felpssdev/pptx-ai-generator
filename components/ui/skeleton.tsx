import * as React from 'react';
import { cn } from '@/lib/utils/cn';

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer rounded-md',
      className
    )}
    {...props}
  />
));
Skeleton.displayName = 'Skeleton';

export { Skeleton };
