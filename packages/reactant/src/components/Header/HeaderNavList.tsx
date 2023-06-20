import { ComponentPropsWithRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const HeaderNavList = forwardRef<HTMLUListElement, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <ul className={cs('flex flex-row items-center gap-5', className)} ref={ref} {...props}>
        {children}
      </ul>
    );
  },
);
