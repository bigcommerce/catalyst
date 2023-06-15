import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, forwardRef, PropsWithChildren } from 'react';

import { cs } from '../../utils/cs';

const buttonVariants = cva(
  'inline-flex w-full justify-center border-2 py-2.5 px-[30px] text-base leading-6 font-semibold border-blue-primary disabled:border-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-blue/20',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-primary text-white hover:bg-blue-secondary hover:border-blue-secondary disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:hover:border-gray-400',
        secondary:
          'bg-transparent text-blue-primary hover:bg-blue-secondary hover:bg-opacity-10 hover:border-blue-secondary hover:text-blue-secondary disabled:text-gray-400 disabled:hover:bg-transparent disabled:hover:border-gray-400 disabled:hover:text-gray-400',
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
