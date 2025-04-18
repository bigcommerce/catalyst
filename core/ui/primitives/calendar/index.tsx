import { clsx } from 'clsx';
import { ChevronLeftIcon } from 'lucide-react';
import { ComponentPropsWithoutRef } from 'react';
import { DayPicker } from 'react-day-picker';

const components = {
  Chevron: () => <ChevronLeftIcon className="h-5 w-5" strokeWidth={1} />,
};

export type CalendarProps = ComponentPropsWithoutRef<typeof DayPicker> & {
  colorScheme?: 'light' | 'dark';
};

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *   --calendar-font-family: var(--font-family-body);
 *   --calendar-light-focus: hsl(var(--foreground));
 *   --calendar-light-border: hsl(var(--contrast-100));
 *   --calendar-light-text: hsl(var(--foreground));
 *   --calendar-light-background: hsl(var(--background));
 *   --calendar-light-button-border-hover: hsl(var(--contrast-200));
 *   --calendar-light-selected-button-background: hsl(var(--primary));
 *   --calendar-light-selected-button-text: hsl(var(--foreground));
 *   --calendar-light-selected-middle-button-background: transparent;
 *   --calendar-light-text-disabled: hsl(var(--contrast-300));
 *   --calendar-light-range-background: color-mix(in oklab, hsl(var(--primary)), white 75%);
 *   --calendar-dark-focus: hsl(var(--background));
 *   --calendar-dark-border: hsl(var(--contrast-500));
 *   --calendar-dark-text: hsl(var(--background));
 *   --calendar-dark-background: hsl(var(--foreground));
 *   --calendar-dark-button-border-hover: hsl(var(--contrast-400));
 *   --calendar-dark-selected-button-background: hsl(var(--primary));
 *   --calendar-dark-selected-button-text: hsl(var(--foreground));
 *   --calendar-dark-selected-middle-button-background: transparent;
 *   --calendar-dark-text-disabled: hsl(var(--contrast-300));
 *   --calendar-dark-range-background: color-mix(in oklab, hsl(var(--primary)), white 60%);
 *  }
 * ```
 */
export function Calendar({
  colorScheme = 'light',
  className,
  classNames,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      {...props}
      className={clsx(
        'box-content w-[280px] rounded-lg border p-3 font-[family-name:var(--calendar-font-family,var(--font-family-body))]',
        {
          light:
            'border-[var(--calendar-light-border,hsl(var(--contrast-100)))] bg-[var(--calendar-light-background,hsl(var(--background)))] text-[var(--calendar-light-text,hsl(var(--foreground)))]',
          dark: 'border-[var(--calendar-dark-border,hsl(var(--contrast-500)))] bg-[var(--calendar-dark-background,hsl(var(--foreground)))] text-[var(--calendar-dark-text,hsl(var(--background)))]',
        }[colorScheme],
        className,
      )}
      classNames={{
        months: 'relative',
        month_caption: 'flex justify-center w-full font-medium pb-0.5',
        nav: 'absolute flex justify-between w-full',
        button_next: clsx(
          'rotate-180 rounded-full focus-visible:outline-none focus-visible:ring-1',
          {
            light: 'focus-visible:ring-[var(--calendar-light-focus,hsl(var(--foreground)))]',
            dark: 'focus-visible:ring-[var(--calendar-dark-focus,hsl(var(--background)))]',
          }[colorScheme],
        ),
        button_previous: clsx(
          'rounded-full focus-visible:outline-none focus-visible:ring-1',
          {
            light: 'focus-visible:ring-[var(--calendar-light-focus,hsl(var(--foreground)))]',
            dark: 'focus-visible:ring-[var(--calendar-dark-focus,hsl(var(--background)))]',
          }[colorScheme],
        ),
        month_grid: 'flex flex-col gap-0.5',
        weeks: 'flex flex-col gap-0.5',
        weekdays: 'flex',
        weekday: 'flex h-10 w-10 items-center justify-center text-xs font-medium',
        week: 'flex',
        day: 'h-10 w-10 flex text-xs font-medium group p-0',
        day_button: clsx(
          'h-full w-full flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-1 disabled:hover:border-none',
          {
            light:
              'group-data-[selected=true]:text-[var(--calendar-light-selected-button-text,hsl(var(--foreground)))] group-data-[selected=true]:bg-[var(--calendar-light-selected-button-background,hsl(var(--primary)))] group-data-[selected=true]/middle:bg-[var(--calendar-light-selected-middle-button-background,transparent)] hover:border hover:border-[var(--calendar-light-button-border-hover,hsl(var(--contrast-200)))] focus-visible:ring-[var(--calendar-light-focus,hsl(var(--foreground)))]',
            dark: 'group-data-[selected=true]:text-[var(--calendar-dark-selected-button-text,hsl(var(--foreground)))] group-data-[selected=true]:bg-[var(--calendar-dark-selected-button-background,hsl(var(--primary)))] group-data-[selected=true]/middle:bg-[var(--calendar-dark-selected-middle-button-background,transparent)] hover:border hover:border-[var(--calendar-dark-button-border-hover,hsl(var(--contrast-400)))] focus-visible:ring-[var(--calendar-dark-focus,hsl(var(--background)))]',
          }[colorScheme],
        ),
        disabled: clsx(
          {
            light: 'text-[var(--calendar-light-text-disabled,hsl(var(--contrast-300)))]',
            dark: 'text-[var(--calendar-dark-text-disabled,hsl(var(--contrast-300)))]',
          }[colorScheme],
        ),
        outside: clsx(
          {
            light: 'text-[var(--calendar-light-text-disabled,hsl(var(--contrast-300)))]',
            dark: 'text-[var(--calendar-dark-text-disabled,hsl(var(--contrast-300)))]',
          }[colorScheme],
        ),
        range_start: clsx(
          'bg-gradient-to-l',
          {
            light:
              'from-[var(--calendar-light-range-background,color-mix(in_oklab,hsl(var(--primary)),white_75%))]',
            dark: 'from-[var(--calendar-dark-range-background,color-mix(in_oklab,hsl(var(--primary)),black_50%))]',
          }[colorScheme],
        ),
        range_middle: clsx(
          'group/middle',
          {
            light:
              'bg-[var(--calendar-light-range-background,color-mix(in_oklab,hsl(var(--primary)),white_75%))]',
            dark: 'bg-[var(--calendar-dark-range-background,color-mix(in_oklab,hsl(var(--primary)),black_50%))]',
          }[colorScheme],
        ),
        range_end: clsx(
          'bg-gradient-to-r',
          {
            light:
              'from-[var(--calendar-light-range-background,color-mix(in_oklab,hsl(var(--primary)),white_75%))]',
            dark: 'from-[var(--calendar-dark-range-background,color-mix(in_oklab,hsl(var(--primary)),black_50%))]',
          }[colorScheme],
        ),
        ...classNames,
      }}
      components={components}
    />
  );
}
