// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import NextLink, { type LinkProps } from 'next/link';
import { ElementRef, forwardRef } from 'react';

type LinkType = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>;

export const Link = forwardRef<ElementRef<'a'>, LinkType>(
  ({ href, prefetch = false, children, ...rest }, ref) => {
    return (
      <NextLink href={href} prefetch={prefetch} ref={ref} {...rest}>
        {children}
      </NextLink>
    );
  },
);
