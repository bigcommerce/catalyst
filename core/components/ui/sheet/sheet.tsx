import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ComponentPropsWithoutRef } from 'react';

import { cn } from '~/lib/utils';

interface Props extends ComponentPropsWithoutRef<typeof SheetPrimitive.Root> {
  title: string;
  trigger?: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const Sheet = ({ title, children, side = 'left', trigger, ...props }: Props) => (
  <SheetPrimitive.Root {...props}>
    {Boolean(trigger) && <SheetPrimitive.Trigger asChild>{trigger}</SheetPrimitive.Trigger>}
    <SheetPrimitive.Portal>
      <SheetPrimitive.Content
        aria-describedby={undefined}
        className={cn(
          'fixed gap-4 overflow-auto bg-white p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out md:p-10',
          side === 'top' &&
            'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
          side === 'bottom' &&
            'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          side === 'left' &&
            'inset-y-0 start-0 h-full w-full border-e data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:w-3/4 sm:max-w-sm',
          side === 'right' &&
            'inset-y-0 end-0 h-full w-full border-s data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:w-3/4 sm:max-w-sm',
        )}
      >
        <div className="mb-6 flex flex-row items-center justify-between">
          <SheetPrimitive.Title asChild>
            <h2 className="text-2xl font-bold">{title}</h2>
          </SheetPrimitive.Title>
          <SheetPrimitive.Close className="focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
            <X className="h-6 w-6">
              <title>Close</title>
            </X>
          </SheetPrimitive.Close>
        </div>
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  </SheetPrimitive.Root>
);

Sheet.displayName = 'Sheet';

export { Sheet };
