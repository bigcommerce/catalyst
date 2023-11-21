import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

type SkeletonProps = ComponentPropsWithRef<'div'>;

export const Skeleton = forwardRef<ElementRef<'div'>, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return <div className={cs('animate-pulse bg-gray-200', className)} ref={ref} {...props} />;
  },
);
