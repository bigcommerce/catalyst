import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import { Check } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

type CheckboxType = typeof CheckboxPrimitive.Root;

const checkboxVariants = cva(
  'block h-6 w-6 border-2 border-gray-200 hover:border-secondary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:hover:border-secondary radix-state-checked:border-primary radix-state-checked:bg-primary radix-state-checked:hover:border-secondary radix-state-checked:hover:bg-secondary disabled:pointer-events-none disabled:bg-gray-100 radix-state-checked:disabled:border-gray-400 radix-state-checked:disabled:bg-gray-400',
  {
    variants: {
      variant: {
        error:
          'border-error-secondary focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 hover:border-error focus-visible:hover:border-error disabled:border-gray-200 radix-state-checked:border-error-secondary radix-state-checked:bg-error-secondary radix-state-checked:hover:border-error radix-state-checked:hover:bg-error',
      },
    },
  },
);

export interface CheckboxProps extends ComponentPropsWithRef<CheckboxType> {
  variant?: 'error';
}

export const Checkbox = forwardRef<ElementRef<CheckboxType>, CheckboxProps>(
  ({ children, className, variant, ...props }, ref) => {
    return (
      <CheckboxPrimitive.Root
        className={cn(checkboxVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex flex-shrink-0 items-center justify-center">
          {children || <Check absoluteStrokeWidth className="stroke-white" size={13} />}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;
