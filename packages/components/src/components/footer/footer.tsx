import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

const Footer = forwardRef<ElementRef<'footer'>, ComponentPropsWithRef<'footer'>>(
  ({ children, className, ...props }, ref) => (
    <footer className={cn('2xl:container 2xl:mx-auto', className)} ref={ref} {...props}>
      {children}
    </footer>
  ),
);

Footer.displayName = 'Footer';

const FooterSection = forwardRef<ElementRef<'section'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => (
    <section
      className={cn(
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

FooterSection.displayName = 'FooterSection';

const FooterNav = forwardRef<ElementRef<'nav'>, ComponentPropsWithRef<'nav'>>(
  ({ children, className, ...props }, ref) => (
    <nav
      aria-label="Footer navigation"
      className={cn('grid flex-auto auto-cols-fr gap-8 sm:grid-flow-col', className)}
      ref={ref}
      {...props}
    >
      {children}
    </nav>
  ),
);

FooterNav.displayName = 'FooterNav';

const FooterNavGroupList = forwardRef<ElementRef<'ul'>, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => (
    <ul className={cn('flex flex-col gap-4', className)} ref={ref} {...props}>
      {children}
    </ul>
  ),
);

FooterNavGroupList.displayName = 'FooterNavGroupList';

interface FooterNavLinkProps extends ComponentPropsWithRef<'a'> {
  asChild?: boolean;
}

const FooterNavLink = forwardRef<ElementRef<'li'>, FooterNavLinkProps>(
  ({ asChild, children, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';

    return (
      <li ref={ref}>
        <Comp className={cn(className)} {...props}>
          {children}
        </Comp>
      </li>
    );
  },
);

FooterNavLink.displayName = 'FooterNavLink';

export { Footer, FooterSection, FooterNav, FooterNavGroupList, FooterNavLink };
