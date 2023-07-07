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
  primary:
    'bg-blue-primary hover:bg-blue-secondary text-white disabled:bg-gray-400 px-6 py-2.5 border-2 border-blue-primary hover:border-blue-secondary focus:border-blue-primary',
  secondary:
    'text-blue-primary hover:text-blue-secondary focus:text-blue-primary hover:bg-blue-primary/10 px-6 py-2.5 border-2 border-blue-primary hover:border-blue-secondary focus:border-blue-primary disabled:border-gray-400 disabled:text-gray-400',
  subtle:
    'border-transparent hover:bg-blue-primary/10 p-3 text-blue-primary hover:text-blue-secondary focus:text-blue-primary disabled:text-gray-400',
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
        'group inline-flex items-center justify-center gap-3 text-center text-base font-semibold ring-4 ring-transparent transition-colors duration-150 focus:ring-blue-primary/20 disabled:border-gray-400',
      )}
      ref={ref}
    >
      {SELECTED_ICON[icon]}

      <span className="leading-normal">{children}</span>
    </button>
  );
});

type BaseLinkButtonProps = {
  link: { href: string; target?: '_self' | '_blank' };
} & Props;

export const LinkButton = forwardRef(function LinkButton(
  { link, className, ...rest }: BaseLinkButtonProps,
  ref: Ref<HTMLAnchorElement>,
) {
  return (
    <Link className={className} href={link.href ? link.href : '#'} ref={ref} target={link.target}>
      <Button {...rest} />
    </Link>
  );
});
