'use client'

import { ComponentPropsWithRef, Ref, forwardRef } from 'react'

import { clsx } from 'clsx'

import { Label } from '@/vibes/soul/primitives/label'

export interface Props extends ComponentPropsWithRef<'textarea'> {
  label?: string
  className?: string
}

export const TextArea = forwardRef(function TextArea(
  { label, className, required, ...rest }: Props,
  ref: Ref<HTMLTextAreaElement>
) {
  return (
    <div className={clsx('w-full', className)}>
      <div className="flex items-center justify-between">
        {label != null && label !== '' && (
          <Label className="mb-2 block text-foreground">{label}</Label>
        )}
        {required === true && <span className="text-xs text-contrast-300">Required</span>}
      </div>
      <div className="relative overflow-hidden rounded-lg border border-contrast-100 bg-background transition-colors duration-200 focus-within:border-foreground focus:outline-none">
        <textarea
          ref={ref}
          {...rest}
          className={clsx(
            'placeholder-contrast-gray-500 w-full bg-transparent p-3 text-foreground placeholder:font-normal focus:outline-none'
          )}
        />
      </div>
    </div>
  )
})
