import { Link } from '~/components/link';

import { clsx } from 'clsx';

export interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'large' | 'medium' | 'small' | 'icon';
  href: string;
  asChild?: boolean;
}

export const ButtonLink = function ButtonLink({
  variant = 'primary',
  size = 'large',
  href,
  className,
  children,
  asChild,
  ...props
}: Props) {
  return (
    <Link
      href={href}
      className={clsx(
        'relative z-0 flex select-none items-center justify-center overflow-hidden rounded-full border text-center font-medium leading-normal transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2',
        {
          primary:
            'border-primary bg-primary text-foreground ring-foreground after:bg-background/40',
          secondary:
            'border-foreground bg-foreground text-background ring-primary after:bg-background',
          tertiary:
            'border-contrast-200 bg-background text-foreground ring-primary after:bg-contrast-100',
        }[variant],
        {
          icon: 'p-2.5 text-sm',
          small: 'gap-x-2 px-4 py-2.5 text-sm',
          medium: 'gap-x-2.5 px-5 py-3 text-base',
          large: 'gap-x-3 px-6 py-4 text-base',
        }[size],
        // After Pseudo Element / Animated Background Styles
        'after:absolute after:inset-0 after:-z-10 after:-translate-x-[105%] after:rounded-full after:transition-[opacity,transform] after:duration-300 after:[animation-timing-function:cubic-bezier(0,0.25,0,1)] hover:after:translate-x-0',
        className,
      )}
      {...props}
    >
      <span className={clsx(variant === 'secondary' && 'mix-blend-difference')}>{children}</span>
    </Link>
  );
};
