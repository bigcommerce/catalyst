import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const RectangleList = forwardRef<ElementRef<'dl'>, ComponentPropsWithRef<'dl'>>(
  ({ children, className, ...props }, ref) => (
    <dl className={cs(className)} ref={ref} {...props}>
      {children}
    </dl>
  ),
);

export const RectangleListLabel = forwardRef<ElementRef<'dt'>, ComponentPropsWithRef<'dt'>>(
  ({ className, children, ...props }, ref) => (
    <dt className={cs('my-2 h-6 font-semibold', className)} ref={ref} {...props}>
      {children}
    </dt>
  ),
);

export const RectangleListGroup = forwardRef<ElementRef<'dd'>, ComponentPropsWithRef<'dd'>>(
  ({ className, ...props }, ref) => (
    <dd className={cs('flex flex-wrap gap-4', className)} ref={ref} {...props} />
  ),
);

interface RectangleListItemProps extends ComponentPropsWithRef<'a'> {
  asChild?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
}

export const RectangleListItem = forwardRef<ElementRef<'a'>, RectangleListItemProps>(
  (
    { asChild = false, className, children, isActive = false, isDisabled = false, href, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'a';

    return isDisabled ? (
      <Comp
        aria-disabled="true"
        className={cs(
          'cursor-not-allowed border-2 border-gray-100 py-2.5 px-6 font-semibold text-gray-400 hover:border-gray-100',
          className,
        )}
        ref={ref}
        role="link"
        {...props}
      >
        {children}
      </Comp>
    ) : (
      <Comp
        className={cs(
          'focus:ring-primary-blue/20 border-2 border-gray-200 py-2.5 px-6 font-semibold hover:border-blue-primary focus:outline-none focus:ring-4',
          isActive && 'border-blue-primary',
          className,
        )}
        href={href}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
