import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef, ReactNode, useId } from 'react';

import { cn } from '~/lib/utils';

interface Option {
  label: string;
  value: string;
}

interface Props extends ComponentPropsWithRef<typeof SelectPrimitive.Root> {
  error?: boolean;
  id?: string;
  label?: string;
  options: Option[];
  placeholder?: string | ReactNode;
}

const Select = forwardRef<ElementRef<typeof SelectPrimitive.Trigger>, Props>(
  ({ children, id: triggerId, label, options, placeholder, error = false, ...props }, ref) => {
    const id = useId();

    return (
      <SelectPrimitive.Root {...props}>
        <SelectPrimitive.Trigger
          aria-label={label}
          className={cn(
            'group relative flex h-12 w-full items-center justify-between border-2 border-gray-200 px-4 py-3 text-base text-black hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200 data-[placeholder]:text-gray-500',
            error &&
              'border-error-secondary hover:border-error focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 disabled:border-gray-200',
          )}
          id={triggerId}
          ref={ref}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="inline group-focus-visible:text-primary group-enabled:group-hover:text-primary" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="max-h-radix-select-content-available-height relative z-50 max-h-96 w-full bg-white shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
            position="popper"
          >
            <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
              <ChevronUpIcon />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]">
              {options.map((option) => {
                const { value, label: optionLabel, ...optionProps } = option;

                return (
                  <SelectPrimitive.Item
                    key={`${id}-${value}`}
                    {...optionProps}
                    className='relative flex w-full cursor-pointer select-none items-center justify-between overflow-visible px-4 py-2 outline-none hover:bg-secondary/10 hover:text-primary focus-visible:bg-secondary/10 data-[disabled]:pointer-events-none data-[state="checked"]:bg-secondary/10 data-[state="checked"]:text-primary data-[disabled]:opacity-50'
                    value={value}
                  >
                    <SelectPrimitive.ItemText>{optionLabel}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator>
                      <Check />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                );
              })}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
              <ChevronDownIcon />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  },
);

Select.displayName = 'Select';

export { Select };
