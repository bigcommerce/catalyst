import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

type SkeletonProps = ComponentPropsWithRef<'div'>;

export const Skeleton = forwardRef<ElementRef<'div'>, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return <div className={cn('animate-pulse bg-gray-200', className)} ref={ref} {...props} />;
  },
);
