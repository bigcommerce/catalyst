import { clsx } from 'clsx';
import { CircleAlert } from 'lucide-react';

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *    --field-error: hsl(var(--error));
 *  }
 * ```
 */
export function FieldError({
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...rest}
      className={clsx(
        'flex items-center gap-1 text-xs text-[var(--field-error,hsl(var(--error)))]',
        className,
      )}
    >
      <CircleAlert size={20} strokeWidth={1.5} />

      {children}
    </div>
  );
}
