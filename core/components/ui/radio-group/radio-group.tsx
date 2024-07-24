import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ComponentPropsWithoutRef, ReactNode, useId } from 'react';

import { cn } from '~/lib/utils';

interface Item extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label: ReactNode;
}

interface Props extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  variant?: 'success' | 'error';
  items: Item[];
}

const RadioGroup = ({ children, className, variant, items, ...props }: Props) => {
  const id = useId();

  return (
    <RadioGroupPrimitive.Root className={className} {...props}>
      {items.map((item) => {
        const { label, value, ...itemProps } = item;

        return (
          <div className="mb-2 flex w-full gap-4" key={`${id}-${value}`}>
            <RadioGroupPrimitive.Item
              {...itemProps}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-200 hover:border-secondary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:hover:border-secondary disabled:pointer-events-none disabled:bg-gray-100 radix-state-checked:border-primary radix-state-checked:bg-primary radix-state-checked:hover:border-secondary radix-state-checked:hover:bg-secondary radix-state-checked:disabled:border-gray-400 radix-state-checked:disabled:bg-gray-400',
                variant === 'success' &&
                  'border-success-secondary hover:border-success focus-visible:border-success-secondary focus-visible:ring-success-secondary/20 focus-visible:hover:border-success disabled:border-gray-200 radix-state-checked:border-success-secondary radix-state-checked:bg-success-secondary radix-state-checked:hover:border-success radix-state-checked:hover:bg-success',
                variant === 'error' &&
                  'border-error-secondary hover:border-error focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 focus-visible:hover:border-error disabled:border-gray-200 radix-state-checked:border-error-secondary radix-state-checked:bg-error-secondary radix-state-checked:hover:border-error radix-state-checked:hover:bg-error',
              )}
              id={`${id}-${value}`}
              value={value}
            >
              <RadioGroupPrimitive.Indicator className="h-2 w-2 rounded-full bg-white" />
            </RadioGroupPrimitive.Item>
            <label className="w-full" htmlFor={`${id}-${item.value}`}>
              {label}
            </label>
          </div>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
};

export { RadioGroup };
