import { clsx } from 'clsx'
import { AlertTriangle, Check, X } from 'lucide-react'

interface Props {
  variant: 'success' | 'warning' | 'error'
  message: string
}

export const Alert = function Alert({ variant, message }: Props) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={clsx(
        'flex min-w-80 max-w-md items-center rounded-xl px-3 py-2.5',
        {
          success: 'bg-success-highlight',
          warning: 'bg-warning-highlight',
          error: 'bg-error-highlight',
        }[variant]
      )}
    >
      <div
        className={clsx(
          'grid aspect-square h-7 place-content-center rounded-full text-foreground',
          {
            success: 'bg-success/50',
            warning: 'bg-warning/30',
            error: 'bg-error/50',
          }[variant]
        )}
      >
        {variant === 'success' ? (
          <Check size={16} strokeWidth={1} />
        ) : variant === 'warning' ? (
          <AlertTriangle size={16} strokeWidth={1} />
        ) : variant === 'error' ? (
          <X size={16} strokeWidth={1} />
        ) : null}
      </div>

      <span className="flex-1 pl-3 pr-5 text-sm leading-normal text-foreground">{message}</span>

      <button
        aria-label="Dismiss alert"
        // onClick={}
      >
        <X size={20} strokeWidth={1} />
      </button>
    </div>
  )
}
