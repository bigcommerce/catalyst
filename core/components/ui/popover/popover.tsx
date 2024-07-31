import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

interface Props extends ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {
  align?: 'start' | 'center' | 'end';
  className?: string;
  sideOffset?: number;
  trigger: ReactNode;
}

const Popover = ({
  align = 'center',
  sideOffset = 4,
  children,
  className,
  trigger,
  ...props
}: Props) => (
  <PopoverPrimitive.Root {...props}>
    <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        className="z-50 bg-white p-4 text-base shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        sideOffset={sideOffset}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  </PopoverPrimitive.Root>
);

Popover.displayName = 'Popover';

export { Popover };
