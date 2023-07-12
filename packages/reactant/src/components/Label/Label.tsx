import * as LabelPrimitive from '@radix-ui/react-label';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const Label = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root className={cs('text-base', className)} ref={ref} {...props} />
));
