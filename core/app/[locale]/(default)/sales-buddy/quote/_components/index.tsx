'use client';

import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useState } from 'react';
import { format } from 'date-fns';
import {CalendarDays} from 'lucide-react'

interface Props{
  placeholder?:string;
}

export default function DatePicker({placeholder}:Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <div className='relative'>
          <input
            type="text"
            value={selectedDate ? format(selectedDate, 'dd-MM-yyyy') : ''}
            placeholder={placeholder}
            readOnly
            className="border w-full cursor-pointer outline-none p-2 rounded-[5px]"
            onClick={() => setIsOpen(true)}
          />
          {/* <CalendarDays className='absolute right-0 bottom-[4px]' width={20} height={20} /> */}
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={5}
            className="bg-white border rounded-md shadow-lg z-50 [&_.rdp-caption\_dropdowns>div]:cursor-pointer [&_.rdp]:[--rdp-cell-size:35px;]  [&_.rdp]:[--rdp-caption-font-size:16px;]
            [&_.rdp-head\_cell]:[font-size:0.70em;] [&_.rdp-day]:[font-size:0.75em;]  [&_.rdp]:[--rdp-accent-color:#03465C]  [&_.rdp-day\_today:not(.rdp-day\_outside)]:bg-brand-100"
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              fromMonth={new Date(1950, 0)}
              toMonth={new Date(2030, 11)}
              defaultMonth={selectedDate || new Date()}
              captionLayout="dropdown"
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
