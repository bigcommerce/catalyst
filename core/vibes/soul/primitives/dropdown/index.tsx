'use client'

import { useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuTriggerProps,
} from '@radix-ui/react-dropdown-menu'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

import { Label } from '@/vibes/soul/primitives/label'

interface Props {
  label: string
  labelOnTop?: boolean
  variant?: 'round' | 'rectangle'
  items: string[]
  required?: boolean
  error?: string
}

export const Dropdown = function Dropdown({
  label,
  labelOnTop = false,
  variant = 'rectangle',
  items,
  required,
  error,
  ...props
}: Props & DropdownMenuTriggerProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between">
        {labelOnTop && <Label className="mb-2 block text-foreground">{label}</Label>}
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
          {selectedItem ?? label}
          <ChevronDown strokeWidth={1.5} className="w-5 text-foreground transition-transform" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="z-50 mt-2 max-h-80 w-full overflow-y-scroll rounded-xl bg-background p-2 shadow-[2px_4px_24px_#00000010] 
          data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 
          data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
          @4xl:rounded-3xl @4xl:p-4"
        >
          {items.map(item => (
            <DropdownMenuItem
              key={item}
              className={clsx(
                'w-full cursor-default select-none rounded-xl px-3 py-2 text-sm font-medium text-contrast-400 outline-none transition-colors',
                'hover:bg-contrast-100 hover:text-foreground @4xl:text-base',
                {
                  'text-foreground': selectedItem === item,
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
    </div>
  )
}
