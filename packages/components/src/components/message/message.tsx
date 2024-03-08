import { cva } from 'class-variance-authority';
import { AlertCircle, Check, Info } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

const messageVariants = cva('flex w-full gap-x-2.5 justify-start p-3 text-base', {
  variants: {
    variant: {
      info: 'bg-secondary/[.15] [&>svg]:text-primary',
      success: 'bg-success-secondary/[.15] [&>svg]:text-success',
      error: 'bg-error-secondary/[.15] [&>svg]:text-error',
    },
  },
});

interface MessageProps extends ComponentPropsWithRef<'div'> {
  readonly variant?: 'info' | 'error' | 'success';
}

export const Message = forwardRef<ElementRef<'div'>, MessageProps>(
  ({ className, children, variant = 'info', ...props }, ref) => (
    <div className={cn(messageVariants({ variant, className }))} ref={ref} {...props}>
      {variant === 'info' && <Info className="flex-none" />}
      {variant === 'error' && <AlertCircle className="flex-none" />}
      {variant === 'success' && <Check className="flex-none" />}
      {children}
    </div>
  ),
);

Message.displayName = 'Message';
