'use client'

import { ComponentPropsWithoutRef } from 'react'
import React from 'react'

import * as SelectPrimitive from '@radix-ui/react-select'
import { clsx } from 'clsx'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { Label } from '@/vibes/soul/primitives/label'

interface Option {
  label: string
  value: string
}

interface Props extends ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  id?: string
  label?: string
  placeholder?: string
  variant?: 'round' | 'rectangle'
  error?: string
  options: Option[]
}

export function Select({
  id,
  label,
  placeholder = 'Select an item',
  variant = 'rectangle',
  options,
  error,
  ...rest
}: Props) {
  return (
    <>
      {label !== undefined && label !== '' && (
        <Label className="mb-2 block text-foreground" htmlFor={id}>
          {label}
        </Label>
      )}
      <SelectPrimitive.Root {...rest}>
        <SelectPrimitive.Trigger
          id={id}
          className={clsx(
            variant === 'rectangle' ? 'rounded-lg' : 'rounded-full',
            'flex h-fit w-full select-none items-center justify-between gap-3 border bg-white p-2 px-5 py-3 font-medium text-foreground',
            'text-sm ring-primary transition-colors hover:bg-contrast-100 focus-visible:outline-none focus-visible:ring-2',
            error != null && error !== '' ? 'border-error' : 'border-contrast-100'
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown strokeWidth={1.5} className="w-5 text-foreground transition-transform" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="mt-2 max-h-80 w-full overflow-y-scroll rounded-xl bg-background p-2 shadow-[2px_4px_24px_#00000010] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:rounded-3xl @4xl:p-4">
            <SelectPrimitive.ScrollUpButton className="flex w-full cursor-default items-center justify-center py-3">
              <ChevronUp strokeWidth={1.5} className="w-5 text-foreground" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport>
              {options.map(option => (
                <SelectPrimitive.Item
                  value={option.value}
                  className={clsx(
                    'w-full cursor-default select-none rounded-xl px-3 py-2 text-sm font-medium text-contrast-400 outline-none transition-colors hover:bg-contrast-100 hover:text-foreground data-[state=checked]:text-foreground @4xl:text-base'
                  )}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex w-full cursor-default items-center justify-center py-3">
              <ChevronDown strokeWidth={1.5} className="w-5 text-foreground" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error !== undefined && error !== '' && <div className="text-xs text-error">{error}</div>}
    </>
  )
}

{
  /* <div>
      <div className="flex items-center justify-between">
        {label && <Label className="mb-2 block text-foreground">{label}</Label>}
        {required === true && <span className="text-xs text-contrast-300">Required</span>}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={clsx(
            variant === 'rectangle' ? 'rounded-lg' : 'rounded-full',
            'flex h-fit w-full select-none items-center justify-between gap-3 border bg-white p-2 px-5 py-3 font-medium text-foreground',
            'text-sm ring-primary transition-colors hover:bg-contrast-100 focus-visible:outline-none focus-visible:ring-2',
            error != null && error !== '' ? 'border-error' : 'border-contrast-100'
          )}
          {...props}
        >
          {activeOption?.label ?? placeholder}
          <ChevronDown strokeWidth={1.5} className="w-5 text-foreground transition-transform" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="z-50 mt-2 max-h-80 w-full overflow-y-scroll rounded-xl bg-background p-2 shadow-[2px_4px_24px_#00000010] 
          data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 
          data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
          @4xl:rounded-3xl @4xl:p-4"
        >
          {options.map(option => (
            <DropdownMenuItem
              key={option.value}
              className={clsx(
                'w-full cursor-default select-none rounded-xl px-3 py-2 text-sm font-medium text-contrast-400 outline-none transition-colors',
                'hover:bg-contrast-100 hover:text-foreground @4xl:text-base',
                {
                  'text-foreground': activeOption?.value === option.value,
                }
              )}
              onSelect={() => setSelectedItem(item)}
            >
              {item}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {error != null && error !== '' && <span className="text-xs text-error">{error}</span>}
    </div> */
}
