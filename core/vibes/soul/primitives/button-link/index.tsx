import { clsx } from 'clsx';

import { Link } from '~/components/link';

export type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'large' | 'medium' | 'small' | 'x-small';
  shape?: 'pill' | 'rounded' | 'square' | 'circle';
  href: string;
};

export function ButtonLink({
  variant = 'primary',
  size = 'large',
  shape = 'pill',
  href,
  className,
  children,
  ...props
}: Props) {
  return (
    <Link
      {...props}
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
        {
          pill: 'rounded-full after:rounded-full',
          rounded: 'rounded-lg after:rounded-lg',
          square: 'rounded-none after:rounded-none',
          circle: 'aspect-square rounded-full after:rounded-full',
        }[shape],
        className,
      )}
      href={href}
    >
      <span className={clsx(variant === 'secondary' && 'mix-blend-difference')}>{children}</span>
    </Link>
  );
}
