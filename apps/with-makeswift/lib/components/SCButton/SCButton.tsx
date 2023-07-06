import Link from 'next/link';
import { ComponentPropsWithoutRef, ReactNode, Ref, forwardRef } from 'react';

import clsx from 'clsx';

import { Filter, Gift, Heart, Scale, Search, ShoppingCart, User } from 'lucide-react';

const SELECTED_ICON = {
  filter: <Filter />,
  gift: <Gift />,
  heart: <Heart />,
  none: '',
  scale: <Scale />,
  search: <Search />,
  'shopping-cart': <ShoppingCart />,
  user: <User />,
};

const VARIANT_STYLES = {
  primary: 'text-white bg-black after:bg-white after:opacity-[15%]',
  secondary: 'text-black bg-gray-100 after:bg-black/5',
  subtle: '',
};

type BaseButtonProps = {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'subtle';
  icon?: 'filter' | 'gift' | 'heart' | 'none' | 'scale' | 'search' | 'shopping-cart' | 'user';
  className?: string;
};

type Props = BaseButtonProps & Omit<ComponentPropsWithoutRef<'button'>, keyof BaseButtonProps>;

export const SCButton = forwardRef(function SCButton(
  { className, children, variant = 'primary', icon = 'none', ...rest }: Props,
  ref: Ref<HTMLButtonElement>,
) {
  return (
    <button
      {...rest}
      ref={ref}
      className={clsx(
        className,
        VARIANT_STYLES[variant],
        "after:-z-1 group relative z-0 inline-flex items-center justify-center gap-3 overflow-hidden px-12 py-4 text-center text-base font-semibold uppercase after:absolute after:inset-y-0 after:left-1/2 after:w-5 after:-translate-x-1/2 after:skew-x-[20deg] after:transition-all after:content-[''] hover:after:w-[120%]",
      )}
    >
      {SELECTED_ICON[icon]}

      <span className="leading-normal">{children}</span>
    </button>
  );
});

type BaseLinkButtonProps = {
  link: { href: string; target?: '_self' | '_blank' };
} & Props;

export const SCLinkButton = forwardRef(function SCLinkButton(
  { link, className, ...rest }: BaseLinkButtonProps,
  ref: Ref<HTMLAnchorElement>,
) {
  return (
    <Link ref={ref} className={className} href={link?.href ?? '#'} target={link?.target}>
      <SCButton {...rest} />
    </Link>
  );
});
