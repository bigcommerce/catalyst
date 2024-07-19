import { AlertCircle, Check, Info } from 'lucide-react';
import { ComponentPropsWithoutRef } from 'react';

import { cn } from '~/lib/utils';

interface Props extends ComponentPropsWithoutRef<'div'> {
  readonly variant?: 'info' | 'error' | 'success';
}

const Message = ({ className, children, variant = 'info', ...props }: Props) => (
  <div
    className={cn(
      'flex w-full justify-start gap-x-2.5 p-3 text-base',
      variant === 'info' && 'bg-secondary/[.15] [&>svg]:text-primary',
      variant === 'success' && 'bg-success-secondary/[.15] [&>svg]:text-success',
      variant === 'error' && 'bg-error-secondary/[.15] [&>svg]:text-error',
      className,
    )}
    {...props}
  >
    {variant === 'info' && <Info className="flex-none" />}
    {variant === 'error' && <AlertCircle className="flex-none" />}
    {variant === 'success' && <Check className="flex-none" />}
    {children}
  </div>
);

export { Message };
