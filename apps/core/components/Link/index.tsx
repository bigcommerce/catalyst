// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import NextLink, { type LinkProps } from 'next/link';
import { ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

type LinkType = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>;

export const Link = forwardRef<ElementRef<'a'>, LinkType>(
  ({ href, prefetch = false, children, className, ...rest }, ref) => {
    return (
      <NextLink
        className={cn(
          ' hover:text-blue-primary focus:outline-none focus:ring-4 focus:ring-blue-primary/20',
          className,
        )}
        href={href}
        prefetch={prefetch}
        ref={ref}
        {...rest}
      >
        {children}
      </NextLink>
    );
  },
);
