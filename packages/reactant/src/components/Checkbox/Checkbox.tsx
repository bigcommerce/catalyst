import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

type CheckboxType = typeof CheckboxPrimitive.Root;

export const Checkbox = forwardRef<ElementRef<CheckboxType>, ComponentPropsWithRef<CheckboxType>>(
  ({ children, className, ...props }, ref) => {
    return (
      <CheckboxPrimitive.Root
        className={cn(
          'block h-6 w-6 border-2 border-gray-200',
          'hover:border-blue-secondary',
          'focus:border-blue-primary focus:outline-none focus:ring-4 focus:ring-blue-primary/20',
          'focus:hover:border-blue-secondary',
          'radix-state-checked:border-blue-primary radix-state-checked:bg-blue-primary',
          'radix-state-checked:hover:border-blue-secondary radix-state-checked:hover:bg-blue-secondary',
          'disabled:pointer-events-none disabled:bg-gray-100',
          'radix-state-checked:disabled:border-gray-400 radix-state-checked:disabled:bg-gray-400',
          className,
        )}
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
