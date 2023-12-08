import { ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';
import { Input, InputProps } from '../Input';

export const FileChooser = forwardRef<ElementRef<'input'>, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        className={cs('file:border-none file:bg-transparent file:font-semibold', className)}
        ref={ref}
        type="file"
        {...props}
      />
    );
  },
);
