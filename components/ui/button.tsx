import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
        outline:
          'border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 focus-visible:ring-brand-500',
        ghost:
          'text-neutral-700 hover:bg-neutral-100 focus-visible:ring-brand-500',
        destructive:
          'bg-error text-white hover:bg-red-600 focus-visible:ring-error',
        success:
          'bg-success text-white hover:bg-emerald-600 focus-visible:ring-success',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      loadingText = 'Loading...',
      disabled,
      children,
      ...props
    },
    ref
  ) => (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      ref={ref}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent' />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
