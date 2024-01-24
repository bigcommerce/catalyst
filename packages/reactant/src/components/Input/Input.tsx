import { cva } from 'class-variance-authority';
import { AlertCircle, Check } from 'lucide-react';
import { ComponentPropsWithRef, createContext, ElementRef, forwardRef, useContext } from 'react';

import { cn } from '~/lib/utils';

const inputVariants = cva(
  'peer focus:ring-blue-primary/20 w-full border-2 border-gray-200 py-2.5 px-4 text-base placeholder:text-gray-500 focus:border-blue-primary focus:outline-none focus:ring-4 hover:border-blue-primary disabled:bg-gray-100 disabled:hover:border-gray-200',
  {
    variants: {
      variant: {
        success:
          'pe-12 border-green-100 focus:border-green-100 focus:ring-green-100/20 disabled:border-gray-200 hover:border-green-200',
        error:
          'pe-12 border-red-100 focus:border-red-100 focus:ring-red-100/20 disabled:border-gray-200 hover:border-red-200',
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
          variant === 'success' && 'text-green-100',
          variant === 'error' && 'text-red-100',
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
