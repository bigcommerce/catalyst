import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const Footer = forwardRef<ElementRef<'footer'>, ComponentPropsWithRef<'footer'>>(
  ({ children, className, ...props }, ref) => (
    <footer
      className={cs(
        'flex flex-col gap-10 border-t border-gray-200 px-6 pt-10 sm:gap-8 sm:px-10 sm:pt-12 lg:px-12',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </footer>
  ),
);

export const FooterSection = forwardRef<ElementRef<'section'>, ComponentPropsWithRef<'section'>>(
  ({ children, className, ...props }, ref) => (
    <section className={cs('flex flex-col gap-8', className)} ref={ref} {...props}>
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

export const FooterNavGroup = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => (
    <div className={cs(className)} ref={ref} {...props}>
      {children}
    </div>
  ),
);

export const FooterNavGroupTitle = forwardRef<HTMLHeadingElement, ComponentPropsWithRef<'h3'>>(
  ({ children, className, ...props }, ref) => (
    <h3 className={cs('mb-4 font-bold', className)} ref={ref} {...props}>
      {children}
    </h3>
  ),
);

export const FooterNavGroupList = forwardRef<ElementRef<'ul'>, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => (
    <ul className={cs('space-y-4', className)} ref={ref} {...props}>
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

export const FooterAddendum = forwardRef<ElementRef<'section'>, ComponentPropsWithRef<'section'>>(
  ({ children, className, ...props }, ref) => (
    <section
      className={cs(
        'order-last flex flex-col gap-10 border-t border-gray-200 py-8 sm:flex-row sm:gap-8 sm:py-6',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </section>
  ),
);
