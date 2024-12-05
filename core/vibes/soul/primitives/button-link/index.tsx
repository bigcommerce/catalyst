import { clsx } from 'clsx';

import { Link } from '~/components/link';

export type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'large' | 'medium' | 'small' | 'x-small' | 'icon' | 'icon-small';
  href: string;
};

export function ButtonLink({
  variant = 'primary',
  size = 'large',
  href,
  className,
  children,
  ...props
}: Props) {
  return (
    <Link
      {...props}
      className={clsx(
        'relative z-0 inline-flex h-fit select-none items-center justify-center overflow-hidden rounded-full border text-center font-semibold leading-normal after:absolute after:inset-0 after:-z-10 after:-translate-x-[105%] after:rounded-full after:transition-[opacity,transform] after:duration-300 after:[animation-timing-function:cubic-bezier(0,0.25,0,1)] hover:after:translate-x-0 focus-visible:outline-none focus-visible:ring-2',
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
        {
          'icon-small': 'min-h-8 p-1.5 text-xs',
          icon: 'min-h-10 p-2.5 text-sm',
          'x-small': 'min-h-8 gap-x-2 px-3 py-1.5 text-xs',
          small: 'min-h-10 gap-x-2 px-4 py-2.5 text-sm',
          medium: 'min-h-12 gap-x-2.5 px-5 py-3 text-base',
          large: 'min-h-14 gap-x-3 px-6 py-4 text-base',
        }[size],
        className,
      )}
      href={href}
    >
      <span className={clsx(variant === 'secondary' && 'mix-blend-difference')}>{children}</span>
    </Link>
  );
}
