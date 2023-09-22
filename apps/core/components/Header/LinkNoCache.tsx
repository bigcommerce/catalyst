'use client';

import { useRouter } from 'next/navigation';
import { ComponentPropsWithRef, ElementRef, forwardRef, startTransition } from 'react';

// Workaround for bypassing client cache
export const LinkNoCache = forwardRef<ElementRef<'a'>, ComponentPropsWithRef<'a'>>(
  ({ href, children, ...props }, ref) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();

      if (href) {
        startTransition(() => {
          router.push(href);
          router.refresh();
        });
      }
    };

    return (
      <a {...props} href={href} onClick={handleClick} ref={ref}>
        {children}
      </a>
    );
  },
);
