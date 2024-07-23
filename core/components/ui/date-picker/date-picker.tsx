'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { DayPickerSingleProps } from 'react-day-picker';

import { Calendar } from '../calendar';
import { Input, InputProps } from '../input';

type Props = Omit<InputProps, 'defaultValue'> & {
  defaultValue?: string | Date;
  selected?: DayPickerSingleProps['selected'];
  onSelect?: DayPickerSingleProps['onSelect'];
  disabledDays?: DayPickerSingleProps['disabled'];
};

export const DatePicker = ({
  defaultValue,
  disabledDays,
  selected,
  onSelect,
  placeholder = 'MM/DD/YYYY',
  required,
  ...props
}: Props) => {
  const [date, setDate] = useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : undefined,
  );

  const formattedSelected = selected ? Intl.DateTimeFormat().format(selected) : undefined;
  const formattedDate = date ? Intl.DateTimeFormat().format(date) : undefined;

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <Input
          icon={<CalendarIcon />}
          placeholder={placeholder}
          readOnly={true}
          required={required}
          type="text"
          value={formattedSelected ?? formattedDate ?? ''}
          {...props}
        />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          className="z-50 w-auto bg-white p-0 text-base shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={4}
        >
          <Calendar
            disabled={disabledDays}
            initialFocus
            mode="single"
            onSelect={onSelect || setDate}
            required={required}
            selected={selected ?? date}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
