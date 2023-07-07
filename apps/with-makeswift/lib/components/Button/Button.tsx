import clsx from 'clsx';
import { Filter, Gift, Heart, Scale, Search, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { ComponentPropsWithoutRef, forwardRef, ReactNode, Ref } from 'react';

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
  primary: 'text-white bg-black after:bg-white after:opacity-[25%]',
  secondary: 'text-black bg-white after:bg-black/10',
  subtle: 'text-black bg-white after:bg-black/5 !p-3',
};

interface BaseButtonProps {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'subtle';
  icon?: 'filter' | 'gift' | 'heart' | 'none' | 'scale' | 'search' | 'shopping-cart' | 'user';
  className?: string;
}

type Props = BaseButtonProps & Omit<ComponentPropsWithoutRef<'button'>, keyof BaseButtonProps>;

export const Button = forwardRef(function Button(
  { className, children, variant = 'primary', icon = 'none', ...rest }: Props,
  ref: Ref<HTMLButtonElement>,
) {
  return (
    <button
      {...rest}
      className={clsx(
        className,
        VARIANT_STYLES[variant],
        "after:-z-1 group relative z-0 inline-flex items-center justify-center gap-3 overflow-hidden px-12 py-4 text-center text-sm font-semibold uppercase after:absolute after:inset-y-0 after:left-1/2 after:w-5 after:-translate-x-1/2 after:skew-x-[20deg] after:transition-all after:content-[''] hover:after:w-[140%]",
      )}
      ref={ref}
    >
      {SELECTED_ICON[icon]}

      <span className="leading-normal">{children}</span>
    </button>
  );
});

type BaseLinkButtonProps = {
  link?: { href: string; target?: '_self' | '_blank' };
} & Props;

export const LinkButton = forwardRef(function LinkButton(
  { link, className, ...rest }: BaseLinkButtonProps,
  ref: Ref<HTMLAnchorElement>,
) {
  return (
    <Link className={className} href={link?.href ?? '#'} ref={ref} target={link?.target}>
      <Button {...rest} />
    </Link>
  );
});
