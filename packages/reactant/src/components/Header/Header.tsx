import { ComponentPropsWithRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const Header = forwardRef<HTMLDivElement, ComponentPropsWithRef<'header'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <header
        className={cs('flex items-center justify-between gap-8 bg-white py-9', className)}
        ref={ref}
        {...props}
      >
        {children}
      </header>
    );
  },
);
