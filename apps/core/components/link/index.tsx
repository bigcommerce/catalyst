// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import NextLink from 'next/link';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

type Props = ComponentPropsWithRef<typeof NextLink>;

export const Link = forwardRef<ElementRef<'a'>, Props>(
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
