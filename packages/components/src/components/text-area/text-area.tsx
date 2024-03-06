import { cva } from 'class-variance-authority';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

const textAreaVariants = cva(
  'focus:ring-primary/20 h-[64px] w-full border-2 border-gray-200 py-2.5 px-4 hover:border-primary focus:border-primary focus:outline-none focus:ring-4',
  {
    variants: {
      variant: {
        success:
          'pe-12 border-success-secondary focus:border-success-secondary focus:ring-success-secondary/20 disabled:border-gray-200 hover:border-success',
        error:
          'ring-error-secondary/20 focus:ring-error-secondary/20 !border-error-secondary pe-12 hover:border-error-secondary focus:border-error-secondary  disabled:border-gray-200',
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
