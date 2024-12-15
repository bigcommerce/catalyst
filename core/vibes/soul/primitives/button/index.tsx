import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'large' | 'medium' | 'small' | 'x-small';
  shape?: 'pill' | 'rounded' | 'square' | 'circle';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

export function Button({
  variant = 'primary',
  size = 'large',
  shape = 'pill',
  onClick,
  loading = false,
  disabled = false,
  className,
  children,
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      aria-busy={loading}
      className={clsx(
        'relative z-0 inline-flex h-fit select-none items-center justify-center overflow-hidden border text-center font-[family-name:var(--button-font-family)] font-semibold leading-normal after:absolute after:inset-0 after:-z-10 after:-translate-x-[105%] after:transition-[opacity,transform] after:duration-300 after:[animation-timing-function:cubic-bezier(0,0.25,0,1)] hover:after:translate-x-0 focus-visible:outline-none focus-visible:ring-2',
        {
          primary:
            'border-[var(--button-primary-border)] bg-[var(--button-primary-background)] text-[var(--button-primary-foreground)] ring-[var(--button-primary-focus)] after:bg-[var(--button-primary-background-hover)]',
          secondary:
            'border-[var(--button-secondary-border)] bg-[var(--button-secondary-background)] text-[var(--button-secondary-foreground)] ring-[var(--button-secondary-focus)] after:bg-[var(--button-secondary-background-hover)]',
          tertiary:
            'border-[var(--button-tertiary-border)] bg-[var(--button-tertiary-background)] text-[var(--button-tertiary-foreground)] ring-[var(--button-tertiary-focus)] after:bg-[var(--button-tertiary-background-hover)]',
          ghost:
            'border-[var(--button-ghost-border)] bg-[var(--button-ghost-background)] text-[var(--button-ghost-foreground)] ring-[var(--button-ghost-focus)] after:bg-[var(--button-ghost-background-hover)]',
        }[variant],
        {
          pill: 'rounded-full after:rounded-full',
          rounded: 'rounded-lg after:rounded-lg',
          square: 'rounded-none after:rounded-none',
          circle: 'rounded-full after:rounded-full',
        }[shape],
        !loading && !disabled && 'hover:after:translate-x-0',
        disabled && 'cursor-not-allowed opacity-30',
        className,
      )}
      onClick={onClick}
      type={type}
      {...props}
    >
      <span
        className={clsx(
          'inline-flex items-center justify-center transition-all duration-300 ease-in-out',
          loading ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100',
          shape === 'circle' && 'aspect-square',
          {
            'x-small': 'min-h-8 text-xs',
            small: 'min-h-10 text-sm',
            medium: 'min-h-12 text-base',
            large: 'min-h-14 text-base',
          }[size],
          shape !== 'circle' &&
            {
              'x-small': 'gap-x-2 px-3 py-1.5',
              small: 'gap-x-2 px-4 py-2.5',
              medium: 'gap-x-2.5 px-5 py-3',
              large: 'gap-x-3 px-6 py-4',
            }[size],
          variant === 'secondary' && 'mix-blend-difference',
        )}
      >
        {children}
      </span>

      <span
        className={clsx(
          'absolute inset-0 grid place-content-center transition-all duration-300 ease-in-out',
          loading ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
        )}
      >
        <Loader2 className={clsx('animate-spin', variant === 'tertiary' && 'text-foreground')} />
      </span>
    </button>
  );
}
