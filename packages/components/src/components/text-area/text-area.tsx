import { cva } from 'class-variance-authority';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

const textAreaVariants = cva(
  'focus:ring-blue-primary/20 h-[64px] w-full border-2 border-gray-200 py-2.5 px-4 hover:border-blue-primary focus:border-blue-primary focus:outline-none focus:ring-4',
  {
    variants: {
      variant: {
        success:
          'pe-12 border-green-100 focus:border-green-100 focus:ring-green-100/20 disabled:border-gray-200 hover:border-green-200',
        error:
          'ring-red-100/20 focus:ring-red-100/20 !border-red-100 pe-12 hover:border-red-100 focus:border-red-100  disabled:border-gray-200',
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
