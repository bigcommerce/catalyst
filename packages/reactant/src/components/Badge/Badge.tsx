import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const Badge = forwardRef<ElementRef<'span'>, ComponentPropsWithRef<'span'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <span
        className={cs(
          'absolute right-0 top-0 min-w-[24px] rounded-[28px] border-2 border-white bg-blue-primary px-1 py-px text-center text-sm font-bold leading-normal text-white',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    );
  },
);
