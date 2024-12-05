import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'large' | 'medium' | 'small' | 'x-small' | 'icon' | 'icon-small';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

export function Button({
  variant = 'primary',
  size = 'large',
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
        'relative z-0 h-fit overflow-hidden rounded-full border font-semibold leading-normal after:absolute after:inset-0 after:-z-10 after:-translate-x-[105%] after:rounded-full after:transition-[opacity,transform] after:duration-300 after:[animation-timing-function:cubic-bezier(0,0.25,0,1)] focus-visible:outline-none focus-visible:ring-2',
        {
          primary:
            'border-primary bg-primary text-foreground ring-foreground after:bg-background/40',
          secondary:
            'border-foreground bg-foreground text-background ring-primary after:bg-background',
          tertiary:
            'border-contrast-200 bg-background text-foreground ring-primary after:bg-contrast-100',
          ghost:
            'border-transparent bg-transparent text-foreground ring-primary after:bg-foreground/5',
        }[variant],
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
          {
            'icon-small': 'min-h-8 p-1.5 text-xs',
            icon: 'min-h-10 p-2.5 text-sm',
            'x-small': 'min-h-8 gap-x-2 px-3 py-1.5 text-xs',
            small: 'min-h-10 gap-x-2 px-4 py-2.5 text-sm',
            medium: 'min-h-12 gap-x-2.5 px-5 py-3 text-base',
            large: 'min-h-14 gap-x-3 px-6 py-4 text-base',
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
