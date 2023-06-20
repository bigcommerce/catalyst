import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

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
