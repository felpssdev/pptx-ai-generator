import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  isClearable?: boolean;
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      success,
      hint,
      isClearable = false,
      onClear,
      value,
      onChange,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const hasSuccess = !!success && !error;

    const handleClear = React.useCallback(() => {
      onClear?.();
    }, [onClear]);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
      },
      [onChange]
    );

    return (
      <div className='w-full'>
        {label && (
          <label
            htmlFor={inputId}
            className='block text-sm font-medium text-neutral-700 mb-2'
          >
            {label}
          </label>
        )}

        <div className='relative'>
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full px-4 py-2 rounded-md border-2 transition-colors bg-white text-neutral-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed',
              'placeholder:text-neutral-500',
              {
                'border-red-500 focus-visible:ring-red-500': hasError,
                'border-emerald-500 focus-visible:ring-emerald-500': hasSuccess,
                'border-neutral-300 focus-visible:ring-blue-500 focus-visible:border-blue-500':
                  !hasError && !hasSuccess,
              },
              'pr-10',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              error || hint
                ? `${inputId}-error-hint`
                : success
                  ? `${inputId}-success`
                  : undefined
            }
            {...props}
          />

          {isClearable && value && (
            <button
              type='button'
              onClick={handleClear}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1'
              aria-label='Clear input'
            >
              <X className='h-4 w-4' />
            </button>
          )}

          {hasSuccess && (
            <div className='absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600'>
              <svg
                className='h-5 w-5'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
          )}
        </div>

        {(error || success || hint) && (
          <div
            id={`${inputId}-error-hint`}
            className={cn('mt-2 text-sm', {
              'text-red-600': hasError,
              'text-emerald-600': hasSuccess,
              'text-neutral-600': hint && !hasError && !hasSuccess,
            })}
          >
            {error || success || hint}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
