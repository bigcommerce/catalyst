'use client'

import { useState } from 'react'

import clsx from 'clsx'
import { Minus, Plus } from 'lucide-react'

interface Props {
  current?: number
  max?: number
  decrementAriaLabel?: string
  incrementAriaLabel?: string
}

export const Counter = function Counter({
  current = 0,
  decrementAriaLabel,
  incrementAriaLabel,
}: Props) {
  const [count, setCount] = useState(current)
  const decrement = () => {
    setCount(prev => prev - 1)
  }
  const increment = () => {
    setCount(prev => prev + 1)
  }

  return (
    <div className="flex items-center justify-between rounded-lg border">
      <button
        className={clsx(
          'group rounded-l-lg p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          { 'hover:bg-contrast-100/50': count > 0 }
        )}
        onClick={decrement}
        aria-label={decrementAriaLabel ?? 'Decrease count'}
        disabled={count === 0}
      >
        <Minus
          className={clsx('text-contrast-300 transition-colors duration-300', {
            'group-hover:text-foreground': count > 0,
          })}
          strokeWidth={1.5}
          size={18}
        />
      </button>
      <input
        className="w-8 select-none text-center focus-visible:outline-none"
        // type="number"
        // style={{
        //   appearance: 'none', // Remove default styling
        //   MozAppearance: 'textfield', // For Firefox
        //   WebkitAppearance: 'none', // For Chrome and Safari
        // }}
        value={count}
      />

      <button
        className="group rounded-r-lg p-3 transition-colors duration-300 hover:bg-contrast-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={increment}
        aria-label={incrementAriaLabel ?? 'Increase count'}
      >
        <Plus
          className="text-contrast-300 transition-colors duration-300 group-hover:text-foreground"
          strokeWidth={1.5}
          size={18}
        />
      </button>
    </div>
  )
}
