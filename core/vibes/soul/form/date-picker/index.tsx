import { ComponentPropsWithoutRef, ElementRef, forwardRef, useState } from 'react'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import { CalendarIcon } from 'lucide-react'

import { Calendar } from '@/vibes/soul/primitives/calendar'

import { Input } from '../input'

interface Props extends Omit<ComponentPropsWithoutRef<'input'>, 'defaultValue' | 'onSelect'> {
  defaultValue?: string | Date
  disabledDays?: Date[]
  errors?: string[]
  onSelect?: (date: Date | undefined) => void
  selected?: Date | undefined
}

const DatePicker = forwardRef<ElementRef<'input'>, Props>(
  (
    {
      defaultValue,
      disabledDays,
      errors,
      onSelect,
      placeholder = 'MM/DD/YYYY',
      required = false,
      selected,
      ...props
    },
    ref
  ) => {
    // State to manage the selected date
    const [date, setDate] = useState<Date | undefined>(
      defaultValue ? new Date(defaultValue) : undefined
    )

    // Format the selected date for display
    const formattedSelected = selected ? Intl.DateTimeFormat().format(selected) : undefined

    // Format the default date for display
    const formattedDate = date ? Intl.DateTimeFormat().format(date) : undefined

    return (
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>
          <Input
            errors={errors}
            prepend={<CalendarIcon className="h-5 w-5" strokeWidth={1} />}
            placeholder={placeholder}
            readOnly={true}
            ref={ref}
            required={required}
            type="text"
            // We control the value of the input based on the selected date or the default date
            value={formattedSelected ?? formattedDate ?? ''}
            {...props}
          />
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            className="z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            sideOffset={8}
          >
            <Calendar
              disabled={disabledDays}
              mode="single"
              onSelect={onSelect || setDate}
              selected={selected ?? date}
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  }
)

DatePicker.displayName = 'DatePicker'

export { DatePicker }
