import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import { Check } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

type CheckboxType = typeof CheckboxPrimitive.Root;

const checkboxVariants = cva(
  'block h-6 w-6 border-2 border-gray-200 hover:border-blue-secondary focus:border-blue-primary focus:outline-none focus:ring-4 focus:ring-blue-primary/20 focus:hover:border-blue-secondary radix-state-checked:border-blue-primary radix-state-checked:bg-blue-primary radix-state-checked:hover:border-blue-secondary radix-state-checked:hover:bg-blue-secondary disabled:pointer-events-none disabled:bg-gray-100 radix-state-checked:disabled:border-gray-400 radix-state-checked:disabled:bg-gray-400',
  {
    variants: {
      variant: {
        error:
          'border-red-100 focus:border-red-100 focus:ring-red-100/20 hover:border-red-200 focus:hover:border-red-200 disabled:border-gray-200 radix-state-checked:border-red-100 radix-state-checked:bg-red-100 radix-state-checked:hover:border-red-200 radix-state-checked:hover:bg-red-200',
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
