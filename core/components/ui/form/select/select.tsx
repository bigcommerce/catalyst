import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
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
            'pop-up-container group relative flex h-[50px] w-full items-center justify-between rounded-[3px] border-[2px] border-[#d7d7d7] p-2.5 text-[16px] font-normal tracking-[0.5px] text-gray-600 hover:border-[#0088B6] focus-visible:border-[#0088B6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0088B6]/20 disabled:bg-gray-100 disabled:hover:border-gray-200 data-[placeholder]:text-gray-500',
            error &&
              'border-error-secondary focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 hover:border-error disabled:border-gray-200',
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
            className="pop-up-containers relative z-[101] max-h-60 w-full min-w-[var(--radix-select-trigger-width)] overflow-hidden bg-white shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
            position="popper"
            sideOffset={5}
          >
            <SelectPrimitive.Viewport className="overflow-y-auto p-0">
              {options.map((option) => {
                const { value, label: optionLabel, ...optionProps } = option;

                return (
                  <SelectPrimitive.Item
                    key={`${id}-${value}`}
                    {...optionProps}
                    className='hover:bg-secondary/10 focus-visible:bg-secondary/10 data-[state="checked"]:bg-secondary/10 relative flex w-full cursor-pointer select-none items-center px-4 py-2 outline-none hover:text-primary data-[disabled]:pointer-events-none data-[state="checked"]:text-primary data-[disabled]:opacity-50'
                    value={value}
                  >
                    <SelectPrimitive.ItemText>{optionLabel}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                );
              })}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  },
);

Select.displayName = 'Select';

export { Select };