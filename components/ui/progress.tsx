import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      showLabel = true,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variantClasses = {
      default: 'bg-brand-600',
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
    };

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        <div
          className='relative w-full h-2 bg-neutral-200 rounded-full overflow-hidden'
          role='progressbar'
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out rounded-full',
              variantClasses[variant]
            )}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        {showLabel && (
          <div className='mt-2 text-sm font-medium text-neutral-600'>
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
