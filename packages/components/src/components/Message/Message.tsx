import { cva } from 'class-variance-authority';
import { AlertCircle, Check } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

const messageVariants = cva('flex w-full gap-x-2.5 justify-start p-3 text-base', {
  variants: {
    variant: {
      success: 'bg-green-300/20 [&>svg]:text-green-300',
      error: 'bg-red-100/20 [&>svg]:text-red-100',
    },
  },
});

interface MessageProps extends ComponentPropsWithRef<'div'> {
  readonly variant?: 'error' | 'success';
}

export const Message = forwardRef<ElementRef<'div'>, MessageProps>(
  ({ className, children, variant, ...props }, ref) => (
    <div className={cn(messageVariants({ variant, className }))} ref={ref} {...props}>
      {variant === 'error' && <AlertCircle className="flex-none" />}
      {variant === 'success' && <Check className="flex-none" />}
      {children}
    </div>
  ),
);

Message.displayName = 'Message';
