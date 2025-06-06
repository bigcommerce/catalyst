import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { clsx } from 'clsx';

interface Props extends React.PropsWithChildren {
  align?: 'center' | 'end' | 'start';
  className?: string;
  delayDuration?: number;
  skipDelayDuration?: number;
  trigger?: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --tooltip-background: hsl(var(--background));
 * ```
 */
export const Tooltip = ({
  align = 'center',
  className = '',
  delayDuration,
  skipDelayDuration,
  trigger,
  open,
  setOpen,
  side = 'top',
  sideOffset = 6,
  children,
}: Props) => {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      <TooltipPrimitive.Root onOpenChange={setOpen} open={open}>
        {trigger != null && (
          <TooltipPrimitive.Trigger asChild={typeof trigger !== 'string'}>
            {trigger}
          </TooltipPrimitive.Trigger>
        )}
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            align={align}
            className={clsx(
              'z-50 max-h-80 rounded-2xl border border-contrast-100 bg-[var(--tooltip-background,hsl(var(--background)))] p-3 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              className,
            )}
            side={side}
            sideOffset={sideOffset}
          >
            {children}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
