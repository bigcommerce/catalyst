'use client'

import * as React from 'react'

import { clsx } from 'clsx'

import { ErrorMessage } from '@/vibes/soul/form/error-message'
import { Label } from '@/vibes/soul/form/label'

export const Textarea = React.forwardRef<
  React.ElementRef<'textarea'>,
  React.ComponentPropsWithoutRef<'textarea'> & {
    prepend?: React.ReactNode
    label?: string
    errors?: string[]
  }
>(({ label, className, required, errors, ...rest }, ref) => {
  return (
    <div className={clsx('space-y-2', className)}>
      <div className="flex items-center justify-between">
        {label != null && label !== '' && <Label>{label}</Label>}
        {required === true && <span className="text-xs text-contrast-300">Required</span>}
      </div>
      <textarea
        {...rest}
        ref={ref}
        className={clsx(
          'placeholder-contrast-gray-500 w-full rounded-lg border bg-background p-3 text-foreground transition-colors duration-200 placeholder:font-normal focus:border-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          errors && errors.length > 0 ? 'border-error' : 'border-contrast-100'
        )}
      />
      {errors?.map(error => <ErrorMessage key={error}>{error}</ErrorMessage>)}
    </div>
  )
})

Textarea.displayName = 'Textarea'
