import { cva } from 'class-variance-authority';
import { AlertCircle, Check } from 'lucide-react';
import { ComponentPropsWithRef, createContext, ElementRef, forwardRef, useContext } from 'react';

import { cn } from '~/lib/utils';

const inputVariants = cva(
  'peer focus-visible:ring-primary/20 w-full border-2 border-gray-200 py-2.5 px-4 text-base placeholder:text-gray-500 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 hover:border-primary disabled:bg-gray-100 disabled:hover:border-gray-200',
  {
    variants: {
      variant: {
        success:
          'pe-12 border-success-secondary focus-visible:border-success-secondary focus-visible:ring-success-secondary/20 disabled:border-gray-200 hover:border-success',
        error:
          'pe-12 border-error-secondary focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 disabled:border-gray-200 hover:border-error',
      },
    },
  },
);

type VariantTypes = 'success' | 'error';

export interface InputProps extends ComponentPropsWithRef<'input'> {
  variant?: VariantTypes;
}

const InputContext = createContext<{ variant?: VariantTypes }>({ variant: undefined });

const InputIcon = forwardRef<ElementRef<'span'>, ComponentPropsWithRef<'span'>>(
  ({ className, children, ...props }, ref) => {
    const { variant } = useContext(InputContext);

    return (
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute end-4 top-0 flex h-full items-center peer-disabled:text-gray-200',
          variant === 'success' && 'text-success-secondary',
          variant === 'error' && 'text-error-secondary',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children ?? (
          <>
            {variant === 'success' && <Check />}
            {variant === 'error' && <AlertCircle />}
          </>
        )}
      </span>
    );
  },
);

InputIcon.displayName = 'InputIcon';

const Input = forwardRef<ElementRef<'input'>, InputProps>(
  ({ className, variant, children, type = 'text', ...props }, ref) => (
    <InputContext.Provider value={{ variant }}>
      <div className={cn('relative')}>
        <input
          className={cn(inputVariants({ variant, className }))}
          ref={ref}
          type={type}
          {...props}
        />
        {children ?? <InputIcon />}
      </div>
    </InputContext.Provider>
  ),
);

Input.displayName = 'Input';

export { Input, InputIcon };
