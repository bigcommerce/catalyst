import { Slot } from '@radix-ui/react-slot';
import { Loader2 as Spinner } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

interface Props extends ComponentPropsWithRef<'button'> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'subtle';
}

const Button = forwardRef<ElementRef<'button'>, Props>(
  (
    {
      asChild = false,
      children,
      className,
      variant = 'primary',
      loading,
      loadingText,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(
          'relative  flex w-full rounded items-center justify-center px-[30px] py-2.5 text-base font-semibold leading-6',
          variant === 'primary' &&
            'bg-sky-400 text-white disabled:bg-sky-400 ',
          // variant === 'secondary' &&
          //   'bg-transparent text-primary disabled:text-sky-400',
          // variant === 'subtle' &&
          //   'text-primary',
          className,
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <>
            <span className="absolute inset-0 loading-span z-10 flex h-full w-full items-center justify-center">
              <Spinner aria-hidden="true" className="animate-spin" />
              <span className="sr-only">{loadingText}</span>
            </span>
            <span className="invisible flex items-center">{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);

Button.displayName = 'Button';

export { Button };
