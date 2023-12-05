'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { DayPickerSingleProps } from 'react-day-picker';

import { Calendar } from '../Calendar';
import { Input, InputIcon, InputProps } from '../Input';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';

type DatePickerProps = InputProps & {
  selected?: DayPickerSingleProps['selected'];
  onSelect?: DayPickerSingleProps['onSelect'];
};

export const DatePicker = React.forwardRef<React.ElementRef<'div'>, DatePickerProps>(
  ({ selected, onSelect, placeholder = 'MM/DD/YYYY', ...props }, ref) => {
    const [date, setDate] = React.useState<Date>();

    const formattedSelected = selected ? format(selected, 'MM/dd/yyyy') : undefined;
    const formattedDate = date ? format(date, 'MM/dd/yyyy') : undefined;

    return (
      <div ref={ref}>
        <Popover>
          <PopoverTrigger asChild>
            <Input
              placeholder={placeholder}
              type="text"
              value={formattedSelected ?? formattedDate}
              {...props}
            >
              <InputIcon>
                <CalendarIcon />
              </InputIcon>
            </Input>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              initialFocus
              mode="single"
              onSelect={onSelect || setDate}
              selected={selected ?? date}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);
