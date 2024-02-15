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
      className={cn('border-t border-gray-200 px-6 py-8 sm:px-10 lg:px-12 2xl:px-0', className)}
      {...props}
      ref={ref}
    >
      {children}
    </section>
  ),
);

FooterSection.displayName = 'FooterSection';

export { Footer, FooterSection };
