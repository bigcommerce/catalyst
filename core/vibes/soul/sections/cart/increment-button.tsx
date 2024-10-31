'use client'

import { useFormStatus } from 'react-dom'

import { Plus } from 'lucide-react'

export function IncrementButton({ ariaLabel }: { ariaLabel?: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      className="group rounded-r-lg p-3 transition-colors duration-300 hover:bg-contrast-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
      aria-label={ariaLabel ?? 'Increase Count'}
      type="submit"
      disabled={pending}
    >
      <Plus
        className="text-contrast-300 transition-colors duration-300 group-hover:text-foreground"
        strokeWidth={1.5}
        size={18}
      />
    </button>
  )
}
