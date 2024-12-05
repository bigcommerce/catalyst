import { clsx } from 'clsx'
import { CheckCircle, CircleAlert } from 'lucide-react'

export function FormStatus({
  className,
  children,
  type = 'success',
  ...rest
}: React.ComponentPropsWithoutRef<'div'> & { type?: 'error' | 'success' }) {
  return (
    <div
      {...rest}
      className={clsx(
        'flex items-center gap-3 rounded-xl bg-error-highlight px-4 py-3 text-xs',
        {
          error: 'bg-error-highlight text-error-shadow',
          success: 'bg-success-highlight text-success-shadow',
        }[type],
        className
      )}
    >
      {type === 'error' && <CircleAlert strokeWidth={1.5} size={20} />}
      {type === 'success' && <CheckCircle strokeWidth={1.5} size={20} />}

      {children}
    </div>
  )
}
