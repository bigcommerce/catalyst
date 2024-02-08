import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { cn } from '~/lib/utils';

import { buttonVariants } from '../button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export const Calendar = ({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps) => {
  return (
    <DayPicker
      className={cn('w-[304px] p-3 shadow-md', className)}
      classNames={{
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-base',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(buttonVariants({ variant: 'subtle' }), 'h-8 w-8 p-0'),
        nav_button_previous: 'absolute start-1',
        nav_button_next: 'absolute end-1',
        head_row: 'flex',
        head_cell: 'text-gray-400 w-10 text-xs font-normal font-normal',
        row: 'flex w-full',
        cell: cn(
          'relative flex h-10 w-10 items-center justify-center p-0 text-center text-xs font-normal focus-within:relative focus-within:z-20 focus-within:rounded focus-within:border focus-within:border-blue-primary/20',
        ),
        day: cn(
          'h-8 w-8 p-0 text-base hover:bg-blue-secondary/10 focus:outline-none aria-selected:bg-blue-primary aria-selected:text-white aria-selected:hover:bg-blue-primary aria-selected:hover:text-white',
        ),
        day_today: 'bg-blue-secondary/10',
        day_disabled: 'text-gray-400 aria-selected:bg-gray-100 aria-selected:text-white',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeftIcon className="h-6 w-6" />,
        IconRight: () => <ChevronRightIcon className="h-6 w-6" />,
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
};

Calendar.displayName = 'Calendar';
