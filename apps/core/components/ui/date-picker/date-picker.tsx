'use client';

import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { DayPickerSingleProps } from 'react-day-picker';

import { Calendar } from '../calendar';
import { Input, InputIcon, InputProps } from '../input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';

type DatePickerProps = Omit<InputProps, 'defaultValue'> & {
  defaultValue?: string | Date;
  selected?: DayPickerSingleProps['selected'];
  onSelect?: DayPickerSingleProps['onSelect'];
  disabledDays?: DayPickerSingleProps['disabled'];
};

export const DatePicker = React.forwardRef<React.ElementRef<'div'>, DatePickerProps>(
  (
    {
      defaultValue,
      disabledDays,
      selected,
      onSelect,
      placeholder = 'MM/DD/YYYY',
      required,
      ...props
    },
    ref,
  ) => {
    const [date, setDate] = React.useState<Date | undefined>(
      defaultValue ? new Date(defaultValue) : undefined,
    );

    const formattedSelected = selected ? Intl.DateTimeFormat().format(selected) : undefined;
    const formattedDate = date ? Intl.DateTimeFormat().format(date) : undefined;

    return (
      <div ref={ref}>
        <Popover>
          <PopoverTrigger asChild>
            <Input
              placeholder={placeholder}
              readOnly={true}
              required={required}
              type="text"
              value={formattedSelected ?? formattedDate ?? ''}
              {...props}
            >
              <InputIcon>
                <CalendarIcon />
              </InputIcon>
            </Input>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              disabled={disabledDays}
              initialFocus
              mode="single"
              onSelect={onSelect || setDate}
              required={required}
              selected={selected ?? date}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);
