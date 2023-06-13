import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { ButtonHTMLAttributes, forwardRef, PropsWithChildren } from 'react';

import { cs } from '../../utils';

const buttonVariants = cva(
  'inline-flex w-full justify-center border-2 py-3 text-base font-semibold border-blue-primary',
  {
    variants: {
      variant: {
        primary: 'bg-blue-primary text-white hover:opacity-95',
        outline: 'bg-white text-blue-primary hover:opacity-95', // TODO: fix hover
      },
      isDisabled: {
        // TODO: fix isDisabled showing up
        true: 'border-gray-300 hover:none', // TODO: check for correct gray color
      },
    },
    compoundVariants: [
      { variant: 'primary', isDisabled: true, className: 'bd-gray-300' },
      { variant: 'outline', isDisabled: true, className: 'text-gray-300' },
    ],
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
  ({ asChild = false, children, className, disabled, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'; // TODO: test asChild link to check styles

    return (
      <Comp
        className={cs(buttonVariants({ variant, isDisabled: disabled, className }))}
        disabled
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
// TODO: do we need this?
Button.displayName = 'Button';
