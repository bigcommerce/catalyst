'use client'

import { useFormStatus } from 'react-dom'

import { Minus } from 'lucide-react'

export function DecrementButton({ ariaLabel }: { ariaLabel?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      className="group rounded-l-lg p-3 hover:bg-contrast-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={ariaLabel ?? 'Decrease Count'}
      type="submit"
      disabled={pending}
    >
      <Minus
        className="text-contrast-300 transition-colors duration-300 group-hover:text-foreground"
        strokeWidth={1.5}
        size={18}
      />
    </button>
  )
}
