import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const Header = forwardRef<HTMLDivElement, ComponentPropsWithRef<'header'>>(
  ({ className, children, ...props }, ref) => (
    <header
      className={cs('flex items-center justify-between gap-8 bg-white py-9', className)}
      ref={ref}
      {...props}
    >
      {children}
    </header>
  ),
);

export const HeaderLogo = forwardRef<HTMLDivElement, ComponentPropsWithRef<'div'>>(
  ({ className, children, ...props }, ref) => (
    <div
      className={cs('flex-none items-center text-h4 font-black', className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ),
);

export const HeaderNav = forwardRef<HTMLDivElement, ComponentPropsWithRef<'nav'>>(
  ({ children, className, ...props }, ref) => (
    <nav aria-label="Main menu" className={cs('flex', className)} ref={ref} {...props}>
      {children}
    </nav>
  ),
);

export const HeaderNavList = forwardRef<HTMLUListElement, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => (
    <ul className={cs('flex flex-row items-center gap-5', className)} ref={ref} {...props}>
      {children}
    </ul>
  ),
);

interface HeaderNavLinkProps extends ComponentPropsWithRef<'a'> {
  asChild?: boolean;
}

export const HeaderNavLink = forwardRef<HTMLAnchorElement, HeaderNavLinkProps>(
  ({ asChild = false, children, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';

    return (
      <Comp
        className={cs(
          'focus:ring-primary-blue/20 p-3 font-semibold hover:text-blue-primary focus:outline-none focus:ring-4',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
