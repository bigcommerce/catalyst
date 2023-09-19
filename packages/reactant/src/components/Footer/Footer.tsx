import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const Footer = forwardRef<ElementRef<'footer'>, ComponentPropsWithRef<'footer'>>(
  ({ children, className, ...props }, ref) => (
    <footer className={cs('2xl:container 2xl:mx-auto', className)} ref={ref} {...props}>
      {children}
    </footer>
  ),
);

export const FooterSection = forwardRef<ElementRef<'section'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => (
    <section
      className={cs(
        'flex flex-col gap-4 border-t border-gray-200 px-6 py-8 2xl:container sm:flex-row sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0',
        className,
      )}
      {...props}
      ref={ref}
    >
      {children}
    </section>
  ),
);

export const FooterNav = forwardRef<ElementRef<'nav'>, ComponentPropsWithRef<'nav'>>(
  ({ children, className, ...props }, ref) => (
    <nav
      aria-label="Footer navigation"
      className={cs('grid flex-auto auto-cols-fr gap-8 sm:grid-flow-col', className)}
      ref={ref}
      {...props}
    >
      {children}
    </nav>
  ),
);

export const FooterNavGroupList = forwardRef<ElementRef<'ul'>, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => (
    <ul className={cs('flex flex-col gap-4', className)} ref={ref} {...props}>
      {children}
    </ul>
  ),
);

interface FooterNavLinkProps extends ComponentPropsWithRef<'a'> {
  asChild?: boolean;
}

export const FooterNavLink = forwardRef<ElementRef<'li'>, FooterNavLinkProps>(
  ({ asChild, children, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';

    return (
      <li ref={ref}>
        <Comp className={cs(className)} {...props}>
          {children}
        </Comp>
      </li>
    );
  },
);
