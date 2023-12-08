'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { DayPickerSingleProps } from 'react-day-picker';

import { Calendar } from '../Calendar';
import { Input, InputIcon, InputProps } from '../Input';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';

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

    const formattedSelected = selected ? format(selected, 'MM/dd/yyyy') : undefined;
    const formattedDate = date ? format(date, 'MM/dd/yyyy') : undefined;

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
