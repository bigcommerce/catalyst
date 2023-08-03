import { cva } from 'class-variance-authority';
import { AlertCircle, Check } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

const messageVariants = cva('flex w-full justify-start gap-x-2.5 py-3 pl-3 text-base', {
  variants: {
    variant: {
      success: 'bg-green-300/20 [&>svg]:text-green-300',
      error: 'bg-red-100/20 [&>svg]:text-red-100',
    },
  },
});

interface MessageProps extends ComponentPropsWithRef<'div'> {
  variant?: 'error' | 'success';
}

export const Message = forwardRef<ElementRef<'div'>, MessageProps>(
  ({ className, children, variant, ...props }, ref) => (
    <div className={cs(messageVariants({ variant, className }))} ref={ref} {...props}>
      {variant === 'error' && <AlertCircle />}
      {variant === 'success' && <Check />}
      {children}
    </div>
  ),
);
