import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

const Breadcrumbs = forwardRef<ElementRef<'nav'>, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <nav aria-label="Breadcrumb" ref={ref}>
        <ul className={cn('flex flex-wrap items-center', className)} {...props}>
          {children}
        </ul>
      </nav>
    );
  },
);

Breadcrumbs.displayName = 'Breadcrumbs';

interface BreadcrumbItemProps extends ComponentPropsWithRef<'a'> {
  asChild?: boolean;
  isActive?: boolean;
}

const BreadcrumbItem = forwardRef<ElementRef<'li'>, BreadcrumbItemProps>(
  ({ asChild, children, className, isActive, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';

    return (
      <li className={cn('flex items-center text-xs font-semibold text-black')} ref={ref}>
        <Comp
          aria-current={isActive ? `page` : undefined}
          className={cn(
            'p-1 font-semibold hover:text-blue-primary focus:outline-none focus:ring-4 focus:ring-blue-primary/20',
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

BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbDivider = forwardRef<ElementRef<'span'>, ComponentPropsWithRef<'span'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <span className={cn('mx-1', className)} ref={ref} {...props}>
        {children}
      </span>
    );
  },
);

BreadcrumbDivider.displayName = 'BreadcrumbDivider';

export { Breadcrumbs, BreadcrumbItem, BreadcrumbDivider };
