import { clsx } from 'clsx';
import { ChevronLeftIcon } from 'lucide-react';
import { ComponentPropsWithoutRef } from 'react';
import { DayPicker } from 'react-day-picker';

const components = {
  Chevron: () => <ChevronLeftIcon className="h-5 w-5" strokeWidth={1} />,
};

export function Calendar({
  className,
  classNames,
  ...props
}: ComponentPropsWithoutRef<typeof DayPicker>) {
  return (
    <DayPicker
      className={clsx(
        'box-content w-[280px] rounded-lg border border-contrast-100 bg-background p-3',
        className,
      )}
      classNames={{
        months: 'relative',
        month_caption: 'flex justify-center w-full font-medium pb-0.5',
        nav: 'absolute flex justify-between w-full',
        button_next:
          'rotate-180 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground',
        button_previous:
          'rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground',
        month_grid: 'flex flex-col gap-0.5',
        weeks: 'flex flex-col gap-0.5',
        weekdays: 'flex',
        weekday: 'flex h-10 w-10 items-center justify-center text-xs font-medium',
        week: 'flex',
        day: 'h-10 w-10 flex text-xs font-medium group p-0',
        day_button:
          'h-full w-full flex items-center justify-center rounded-full group-data-[selected=true]:bg-primary group-data-[selected=true]/middle:bg-transparent hover:border hover:border-contrast-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground disabled:hover:border-none',
        disabled: 'text-contrast-300',
        outside: 'text-contrast-300',
        range_start: 'bg-gradient-to-l from-primary-highlight',
        range_middle: 'bg-primary-highlight group/middle',
        range_end: 'bg-gradient-to-r from-primary-highlight',
        ...classNames,
      }}
      components={components}
      {...props}
    />
  );
}
