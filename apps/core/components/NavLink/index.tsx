'use client';

import { ComponentProps, ElementRef, forwardRef } from 'react';

import { Link } from '../../navigation';

type NavLinkProp = ComponentProps<typeof Link>;
type NavLinkType = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NavLinkProp> &
  NavLinkProp & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>;

// This component wraps next/link and automatically prefixes the href with the current locale as necessary.
// https://next-intl-docs.vercel.app/docs/routing/navigation#link
export const NavLink = forwardRef<ElementRef<'a'>, NavLinkType>(
  ({ href, prefetch = false, children, ...rest }, ref) => {
    return (
      <Link href={href} prefetch={prefetch} ref={ref} {...rest}>
        {children}
      </Link>
    );
  },
);
