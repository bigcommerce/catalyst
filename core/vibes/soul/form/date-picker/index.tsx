import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CalendarIcon } from 'lucide-react';
import { ComponentPropsWithoutRef, ComponentRef, forwardRef, useState } from 'react';

import { Input } from '@/vibes/soul/form/input';
import { Calendar } from '@/vibes/soul/primitives/calendar';

type CalendarProps = ComponentPropsWithoutRef<typeof Calendar>;

type Props = {
  defaultValue?: string | Date;
  disabledDays?: CalendarProps['disabled'];
  errors?: string[];
  onSelect?: (date: Date | undefined) => void;
  selected?: Date | undefined;
  colorScheme?: 'light' | 'dark';
} & Omit<ComponentPropsWithoutRef<typeof Input>, 'defaultValue' | 'onSelect' | 'value' | 'type'>;

const DatePicker = forwardRef<ComponentRef<typeof Input>, Props>(
  (
    {
      defaultValue,
      disabledDays,
      errors,
      onSelect,
      placeholder = 'MM/DD/YYYY',
      required = false,
      selected,
      colorScheme = 'light',
      ...props
    },
    ref,
  ) => {
    // State to manage the selected date
    const [date, setDate] = useState<Date | undefined>(
      defaultValue != null ? new Date(defaultValue) : undefined,
    );

    // Format the selected date for display
    const formattedSelected = selected ? Intl.DateTimeFormat().format(selected) : undefined;

    // Format the default date for display
    const formattedDate = date ? Intl.DateTimeFormat().format(date) : undefined;

    return (
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>
          <Input
            {...props}
            colorScheme={colorScheme}
            errors={errors}
            placeholder={placeholder}
            prepend={<CalendarIcon className="h-5 w-5" strokeWidth={1} />}
            readOnly={true}
            ref={ref}
            required={required}
            type="text"
            // We control the value of the input based on the selected date or the default date
            value={formattedSelected ?? formattedDate ?? ''}
          />
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50"
            sideOffset={8}
          >
            <Calendar
              colorScheme={colorScheme}
              disabled={disabledDays}
              mode="single"
              onSelect={onSelect ?? setDate}
              selected={selected ?? date}
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
