import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const Breadcrumbs = forwardRef<ElementRef<'nav'>, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ref, ...props }) => {
    return (
      <nav aria-label="Breadcrumb" ref={ref}>
        <ul className={cs('flex flex-wrap items-center', className)} {...props}>
          {children}
        </ul>
      </nav>
    );
  },
);

interface BreadcrumbItemProps extends ComponentPropsWithRef<'a'> {
  asChild?: boolean;
  isActive?: boolean;
}

export const BreadcrumbItem = forwardRef<ElementRef<'li'>, BreadcrumbItemProps>(
  ({ asChild, children, className, isActive, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';

    return (
      <li className={cs('flex items-center text-sm text-black')} ref={ref}>
        <Comp
          aria-current={isActive ? `page` : undefined}
          className={cs(
            'focus:ring-primary-blue/20 p-1 font-semibold font-semibold hover:text-blue-primary focus:outline-none focus:ring-4',
            isActive && 'cursor-default font-extrabold hover:text-black',
            className,
          )}
          {...props}
        >
          {children}
        </Comp>
      </li>
    );
  },
);

export const BreadcrumbDivider = forwardRef<ElementRef<'span'>, ComponentPropsWithRef<'span'>>(
  ({ children, className, ref, ...props }) => {
    return (
      <span className={cs('mx-1', className)} ref={ref} {...props}>
        {children}
      </span>
    );
  },
);
