import { cva } from 'class-variance-authority';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

const textAreaVariants = cva(
  'focus-visible:ring-primary/20 h-[64px] w-full border-2 border-gray-200 py-2.5 px-4 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4',
  {
    variants: {
      variant: {
        success:
          'pe-12 border-success-secondary focus-visible:border-success-secondary focus-visible:ring-success-secondary/20 disabled:border-gray-200 hover:border-success',
        error:
          'ring-error-secondary/20 focus-visible:ring-error-secondary/20 !border-error-secondary pe-12 hover:border-error-secondary focus-visible:border-error-secondary  disabled:border-gray-200',
      },
    },
  },
);

interface TextAreaProps extends ComponentPropsWithRef<'textarea'> {
  variant?: 'error' | 'success';
}

export const TextArea = forwardRef<ElementRef<'textarea'>, TextAreaProps>(
  ({ className, required, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textAreaVariants({ variant, className }))}
        ref={ref}
        required={required}
        {...props}
      />
    );
  },
);

TextArea.displayName = 'TextArea';
