'use client'

import { ComponentPropsWithRef, Ref, forwardRef } from 'react'

import { clsx } from 'clsx'

import { Label } from '@/vibes/soul/primitives/label'

export interface Props extends ComponentPropsWithRef<'input'> {
  prepend?: string
  label?: string
  error?: string
  className?: string
}

export const Input = forwardRef(function Input(
  { prepend, label, className, required, error, ...rest }: Props,
  ref: Ref<HTMLInputElement>
) {
  return (
    <div className={clsx('w-full', className)}>
      <div className="flex items-center justify-between">
        {label != null && label !== '' && (
          <Label className="mb-2 block text-foreground">{label}</Label>
        )}
        {required === true && <span className="text-xs text-contrast-300">Required</span>}
      </div>
      <div
        className={clsx(
          'relative overflow-hidden rounded-lg border bg-background transition-colors duration-200 focus-within:border-foreground focus:outline-none',
          error != null && error !== '' ? 'border-error' : 'border-contrast-100'
        )}
      >
        {prepend != null && prepend !== '' && (
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
            {prepend}
          </span>
        )}
        <input
          ref={ref}
          {...rest}
          className={clsx(
            'placeholder-contrast-gray-500 w-full bg-transparent px-6 py-3 text-foreground [appearance:textfield] placeholder:font-normal focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            {
              'py-3 pl-10 pr-6': prepend,
            }
          )}
        />
      </div>
      {error != null && error !== '' && <span className="text-xs text-error">{error}</span>}
    </div>
  )
})
