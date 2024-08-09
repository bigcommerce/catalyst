import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

interface Props extends ComponentPropsWithRef<'textarea'> {
  error?: boolean;
}

const TextArea = forwardRef<ElementRef<'textarea'>, Props>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'h-[64px] w-full border-2 border-gray-200 px-4 py-2.5 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
          error &&
            '!border-error-secondary pe-12 ring-error-secondary/20 hover:border-error-secondary focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 disabled:border-gray-200',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

TextArea.displayName = 'TextArea';

export { TextArea };
