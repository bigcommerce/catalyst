'use client'

import { useActionState, useEffect } from 'react'

import { clsx } from 'clsx'
import { Trash2 } from 'lucide-react'

import { Spinner } from '@/vibes/soul/primitives/spinner'

export type Action<State, Payload> = (state: State, payload: Payload) => State | Promise<State>

export function RemoveButton({
  id,
  action,
  removeItemAriaLabel,
  loadingAriaLabel,
}: {
  id: string
  action: Action<{ error: string | null }, string>
  removeItemAriaLabel?: string
  loadingAriaLabel?: string
}) {
  const [{ error }, formAction, isPending] = useActionState(action, { error: null })

  useEffect(() => {
    if (error != null) console.error(error)
  }, [error])

  return (
    <form action={formAction.bind(null, id)}>
      <button
        type="submit"
        aria-label={removeItemAriaLabel ?? 'Remove Item'}
        className={clsx(
          '-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4',
          !isPending && 'hover:bg-contrast-100'
        )}
        disabled={isPending}
      >
        {isPending ? (
          <Spinner size="sm" loadingAriaLabel={loadingAriaLabel} />
        ) : (
          <Trash2 strokeWidth={1} size={18} />
        )}
      </button>
    </form>
  )
}
