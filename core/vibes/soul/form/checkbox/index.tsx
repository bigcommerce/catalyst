'use client'

import * as React from 'react'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as LabelPrimitive from '@radix-ui/react-label'
import { clsx } from 'clsx'
import { Check } from 'lucide-react'

import { ErrorMessage } from '@/vibes/soul/form/error-message'

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    label?: React.ReactNode
    errors?: string[]
  }
>(({ id, label, errors, className, ...rest }) => {
  return (
    <div className="space-y-2">
      <div className={clsx('flex items-center gap-2', className)}>
        <CheckboxPrimitive.Root
          {...rest}
          id={id}
          className={clsx(
            'flex h-5 w-5 items-center justify-center rounded-md border transition-colors duration-150 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary data-[state=checked]:border-foreground data-[state=unchecked]:border-contrast-200 data-[state=checked]:bg-foreground data-[state=unchecked]:bg-background',
            errors && errors.length > 0 ? 'border-error' : 'border-contrast-200'
          )}
        >
          <CheckboxPrimitive.Indicator>
            <Check color="white" className="h-4 w-4" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {label != null && label !== '' && (
          <LabelPrimitive.Root className="cursor-pointer font-body text-sm" htmlFor={id}>
            {label}
          </LabelPrimitive.Root>
        )}
      </div>
      {errors?.map(error => <ErrorMessage key={error}>{error}</ErrorMessage>)}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'
