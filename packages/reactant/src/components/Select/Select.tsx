import * as SelectPrimitive from '@radix-ui/react-select';
import { cva } from 'class-variance-authority';
import { Check, ChevronDown } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

const selectVariants = cva(
  'focus:ring-blue-primary/20 group flex h-12 w-full items-center justify-between border-2 border-gray-200 px-4 py-3 text-base text-black hover:border-blue-primary focus:border-blue-primary focus:outline-none focus:ring-4 disabled:bg-gray-100 disabled:hover:border-gray-200 data-[placeholder]:text-gray-500',
  {
    variants: {
      variant: {
        success:
          'border-green-100 focus:border-green-100 focus:ring-green-100/20 disabled:border-gray-200 hover:border-green-200',
        error:
          'border-red-100 focus:border-red-100 focus:ring-red-100/20 disabled:border-gray-200 hover:border-red-200',
      },
    },
  },
);

type SelectType = typeof SelectPrimitive.Root;
type SelectTriggerType = typeof SelectPrimitive.Trigger;

interface SelectProps extends ComponentPropsWithRef<SelectType> {
  variant?: 'success' | 'error';
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

// We need to pass the ref to the Trigger component so we need to type it as such.
const Select = forwardRef<ElementRef<SelectTriggerType>, SelectProps>(
  ({ children, placeholder, className, variant, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <SelectPrimitive.Root {...props}>
        <SelectPrimitive.Trigger
          aria-label={ariaLabel}
          className={cn(selectVariants({ variant, className }))}
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

Select.displayName = SelectPrimitive.Root.displayName;

type SelectContentType = typeof SelectPrimitive.Content;

const SelectContent = forwardRef<
  ElementRef<SelectContentType>,
  ComponentPropsWithRef<SelectContentType>
>(({ children, className, ...props }, ref) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        {...props}
        className={cn(
          'relative w-full bg-white shadow-md max-h-radix-select-content-available-height data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
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

SelectContent.displayName = SelectPrimitive.Content.displayName;

type SelectItemType = typeof SelectPrimitive.Item;

const SelectItem = forwardRef<ElementRef<SelectItemType>, ComponentPropsWithRef<SelectItemType>>(
  ({ children, className, ...props }, ref) => {
    return (
      <SelectPrimitive.Item
        {...props}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center justify-between overflow-visible px-4 py-2 outline-none hover:bg-blue-secondary/10 hover:text-blue-primary focus:bg-blue-secondary/10 data-[disabled]:pointer-events-none data-[state="checked"]:bg-blue-secondary/10 data-[state="checked"]:text-blue-primary data-[disabled]:opacity-50',
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
  },
);

SelectItem.displayName = SelectPrimitive.Item.displayName;

export { Select, SelectContent, SelectItem };
