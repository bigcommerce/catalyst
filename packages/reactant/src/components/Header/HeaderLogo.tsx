import { ComponentPropsWithRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const HeaderLogo = forwardRef<HTMLDivElement, ComponentPropsWithRef<'div'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cs('flex-none items-center text-h4 font-black', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);
