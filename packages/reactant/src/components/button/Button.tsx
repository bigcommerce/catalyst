import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, forwardRef, PropsWithChildren } from 'react';

import { cs } from '../../utils';

const buttonVariants = cva(
  'inline-flex w-full justify-center border-2 py-3 text-base font-semibold border-blue-primary disabled:border-gray-50',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-primary text-white hover:opacity-95 disabled:bg-gray-50 disabled:hover:opacity-100',
        outline:
          'bg-white text-blue-primary hover:bg-opacity-10 hover:bg-blue-primary disabled:text-gray-50 disabled:hover:bg-opacity-100 disabled:hover:bg-white',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(
  ({ asChild = false, children, className, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp className={cs(buttonVariants({ variant, className }))} ref={ref} {...props}>
        {children}
      </Comp>
    );
  },
);
