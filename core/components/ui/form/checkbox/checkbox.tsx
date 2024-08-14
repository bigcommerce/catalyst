import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

interface Props extends ComponentPropsWithRef<typeof CheckboxPrimitive.Root> {
  error?: boolean;
}

const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, Props>(
  ({ className, defaultChecked, error = false, onCheckedChange, ...props }, ref) => {
    return (
      <CheckboxPrimitive.Root
        className={cn(
          'block h-6 w-6 border-2 border-gray-200 hover:border-secondary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:hover:border-secondary disabled:pointer-events-none disabled:bg-gray-100 radix-state-checked:border-primary radix-state-checked:bg-primary radix-state-checked:hover:border-secondary radix-state-checked:hover:bg-secondary radix-state-checked:disabled:border-gray-400 radix-state-checked:disabled:bg-gray-400',
          error &&
            'border-error-secondary hover:border-error focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 focus-visible:hover:border-error disabled:border-gray-200 radix-state-checked:border-error-secondary radix-state-checked:bg-error-secondary radix-state-checked:hover:border-error radix-state-checked:hover:bg-error',
          className,
        )}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        ref={ref}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex flex-shrink-0 items-center justify-center">
          <Check absoluteStrokeWidth className="stroke-white" size={13} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
