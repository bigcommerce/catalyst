import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

type SelectType = typeof SelectPrimitive.Root;
type SelectTriggerType = typeof SelectPrimitive.Trigger;

interface SelectProps extends ComponentPropsWithRef<SelectType> {
  placeholder?: string;
  className?: string;
}

// We need to pass the ref to the Trigger component so we need to type it as such.
export const Select = forwardRef<ElementRef<SelectTriggerType>, SelectProps>(
  ({ children, placeholder, className, ...props }, ref) => {
    return (
      <SelectPrimitive.Root {...props}>
        <SelectPrimitive.Trigger
          className={cs(
            'focus:ring-primary-blue/20 group flex h-12 w-full items-center justify-between border-2 border-gray-200 px-4 py-3 text-base text-black hover:border-blue-primary focus:border-blue-primary focus:outline-none focus:ring-4 disabled:bg-gray-100 disabled:hover:border-gray-200 data-[placeholder]:text-gray-500',
            className,
          )}
          ref={ref}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          {/* TODO: For the sake of moving fast we are leaving this in, but in the future we need to figure out how enable custom icons */}
          <SelectPrimitive.Icon>
            <ChevronDown className="inline group-focus:text-blue-primary group-enabled:group-hover:text-blue-primary" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        {children}
      </SelectPrimitive.Root>
    );
  },
);

type SelectContentType = typeof SelectPrimitive.Content;

export const SelectContent = forwardRef<
  ElementRef<SelectContentType>,
  ComponentPropsWithRef<SelectContentType>
>(({ children, className, ...props }, ref) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        {...props}
        className={cs(
          'relative z-10 w-full bg-white shadow-md max-h-radix-select-content-available-height data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className,
        )}
        ref={ref}
      >
        <SelectPrimitive.Viewport className="w-full min-w-[var(--radix-select-trigger-width)] h-radix-select-content-available-height">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

type SelectItemType = typeof SelectPrimitive.Item;

export const SelectItem = forwardRef<
  ElementRef<SelectItemType>,
  ComponentPropsWithRef<SelectItemType>
>(({ children, className, ...props }, ref) => {
  return (
    <SelectPrimitive.Item
      {...props}
      className={cs(
        'relative z-10 flex w-full cursor-pointer select-none items-center justify-between overflow-visible py-2 px-4 outline-none hover:bg-blue-secondary/10 hover:text-blue-primary focus:bg-blue-secondary/10 data-[disabled]:pointer-events-none data-[state="checked"]:bg-blue-secondary/10 data-[state="checked"]:text-blue-primary data-[disabled]:opacity-50',
        className,
      )}
      ref={ref}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      {/* TODO: For the sake of moving fast we are leaving this in, but in the future we need to figure out how enable custom indicators */}
      <SelectPrimitive.ItemIndicator>
        <Check />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});
