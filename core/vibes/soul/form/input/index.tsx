'use client'

import * as React from 'react'

import { clsx } from 'clsx'

import { ErrorMessage } from '@/vibes/soul/form/error-message'
import { Label } from '@/vibes/soul/form/label'

export const Input = React.forwardRef<
  React.ElementRef<'input'>,
  React.ComponentPropsWithoutRef<'input'> & {
    prepend?: React.ReactNode
    label?: string
    errors?: string[]
  }
>(({ prepend, label, className, required, errors, ...rest }, ref) => {
  return (
    <div className={clsx('w-full space-y-2', className)}>
      {label != null && label !== '' && (
        <div className="flex items-center justify-between">
          <Label>{label}</Label>
          {required === true && <span className="text-xs text-contrast-300">Required</span>}
        </div>
      )}
      <div
        className={clsx(
          'relative overflow-hidden rounded-lg border bg-background transition-colors duration-200 focus-within:border-foreground focus:outline-none',
          errors && errors.length > 0 ? 'border-error' : 'border-contrast-100'
        )}
      >
        {prepend != null && prepend !== '' && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
            {prepend}
          </span>
        )}
        <input
          {...rest}
          ref={ref}
          className={clsx(
            'placeholder-contrast-gray-500 w-full bg-transparent px-6 py-3 text-sm text-foreground [appearance:textfield] placeholder:font-normal focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            { 'py-2.5 pe-4 ps-12': prepend }
          )}
        />
      </div>
      {errors?.map(error => <ErrorMessage key={error}>{error}</ErrorMessage>)}
    </div>
  )
})

Input.displayName = 'Input'
