import { clsx } from 'clsx';
import { CircleAlert } from 'lucide-react';

export function ErrorMessage({
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div {...rest} className={clsx('flex items-center gap-1 text-xs text-error', className)}>
      <CircleAlert size={20} strokeWidth={1.5} />

      {children}
    </div>
  );
}
