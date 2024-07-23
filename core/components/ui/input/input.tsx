import { AlertCircle, Check } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef, ReactNode } from 'react';

import { cn } from '~/lib/utils';

interface InputProps extends ComponentPropsWithRef<'input'> {
  variant?: 'success' | 'error';
  icon?: ReactNode;
}

const Input = forwardRef<ElementRef<'input'>, InputProps>(
  ({ className, variant, children, icon, type = 'text', ...props }, ref) => (
    <div className={cn('relative', className)}>
      <input
        className={cn(
          'peer w-full border-2 border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200',
          variant === 'success' &&
            'border-success-secondary pe-12 hover:border-success focus-visible:border-success-secondary focus-visible:ring-success-secondary/20 disabled:border-gray-200',
          variant === 'error' &&
            'border-error-secondary pe-12 hover:border-error focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 disabled:border-gray-200',
        )}
        ref={ref}
        type={type}
        {...props}
      />
      {Boolean(variant || icon) && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute end-4 top-0 flex h-full items-center peer-disabled:text-gray-200',
            variant === 'success' && 'text-success-secondary',
            variant === 'error' && 'text-error-secondary',
          )}
        >
          {icon ?? (
            <>
              {variant === 'success' && <Check />}
              {variant === 'error' && <AlertCircle />}
            </>
          )}
        </span>
      )}
    </div>
  ),
);

Input.displayName = 'Input';

export { Input, type InputProps };
