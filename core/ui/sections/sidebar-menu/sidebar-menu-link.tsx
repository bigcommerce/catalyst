'use client';

import { clsx } from 'clsx';
import React from 'react';

import { Link } from '~/components/link';
import { usePathname } from '~/i18n/routing';

export function SidebarMenuLink({
  className,
  href,
  ...rest
}: React.ComponentPropsWithoutRef<typeof Link>) {
  const pathname = usePathname();
  const linkPathname = typeof href === 'string' ? href : (href.pathname ?? null);

  return (
    <Link
      {...rest}
      className={clsx(
        'flex min-h-10 items-center rounded-md px-3 text-sm font-semibold',
        linkPathname !== null && pathname.includes(linkPathname)
          ? 'bg-contrast-100'
          : 'hover:bg-contrast-100',
        className,
      )}
      href={href}
    />
  );
}
