import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

export const buttonVariants = cva(
  'inline-flex w-full justify-center items-center border-2 py-2.5 px-[30px] text-base leading-6 font-semibold border-blue-primary disabled:border-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-primary/20',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-primary text-white hover:bg-blue-secondary hover:border-blue-secondary disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:hover:border-gray-400',
        secondary:
          'bg-transparent text-blue-primary hover:bg-blue-secondary hover:bg-opacity-10 hover:border-blue-secondary hover:text-blue-secondary disabled:text-gray-400 disabled:hover:bg-transparent disabled:hover:border-gray-400 disabled:hover:text-gray-400',
        subtle:
          'border-none bg-transparent text-blue-primary hover:bg-blue-secondary hover:bg-opacity-10 hover:text-blue-secondary disabled:text-gray-400 disabled:hover:bg-transparent disabled:hover:text-gray-400',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'subtle';
  asChild?: boolean;
}

export const Button = forwardRef<ElementRef<'button'>, ButtonProps>(
  ({ asChild = false, children, className, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp className={cn(buttonVariants({ variant, className }))} ref={ref} {...props}>
        {children}
      </Comp>
    );
  },
);

Button.displayName = 'Button';
