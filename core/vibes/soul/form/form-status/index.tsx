import { clsx } from 'clsx';
import { CheckCircle, CircleAlert } from 'lucide-react';

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
        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm',
        {
          error: 'bg-error-highlight text-error-shadow',
          success: 'bg-success-highlight text-success-shadow',
        }[type],
        className,
      )}
    >
      {type === 'error' && <CircleAlert className="shrink-0" size={20} strokeWidth={1.5} />}
      {type === 'success' && <CheckCircle className="shrink-0" size={20} strokeWidth={1.5} />}

      {children}
    </div>
  );
}
