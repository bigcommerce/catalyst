import { ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

import { Input, InputProps } from '../Input';

export const FileChooser = forwardRef<ElementRef<'input'>, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        className={cn('file:border-none file:bg-transparent file:font-semibold', className)}
        ref={ref}
        type="file"
        {...props}
      />
    );
  },
);
