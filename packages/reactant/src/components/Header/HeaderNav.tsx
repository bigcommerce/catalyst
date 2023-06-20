import { ComponentPropsWithRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const HeaderNav = forwardRef<HTMLDivElement, ComponentPropsWithRef<'nav'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <nav aria-label="Main menu" className={cs('flex', className)} ref={ref} {...props}>
        {children}
      </nav>
    );
  },
);
