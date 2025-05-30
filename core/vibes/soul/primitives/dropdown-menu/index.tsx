'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx';
import React, { PropsWithChildren } from 'react';

import { Link } from '~/components/link';

export interface DropdownMenuItem {
  className?: string;
  disabled?: boolean;
  label: React.ReactNode;
  component?: React.ReactNode;
  variant?: 'default' | 'danger';
  action?: string | ((event: React.MouseEvent<HTMLDivElement>) => void);
  asChild?: boolean;
}

interface Props extends PropsWithChildren {
  className?: string;
  items: Array<DropdownMenuItem | 'separator'>;
  align?: 'center' | 'end' | 'start' | undefined;
  slideOffset?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --dropdown-menu-background: hsl(var(--background));
 *   --dropdown-menu-item-focus: hsl(var(--primary));
 *   --dropdown-menu-item-text: hsl(var(--contrast-500));
 *   --dropdown-menu-item-text-hover: hsl(var(--foreground));
 *   --dropdown-menu-item-danger-text: hsl(var(--error));
 *   --dropdown-menu-item-danger-text-hover: color-mix(in oklab, hsl(var(--error)), black 75%);
 *   --dropdown-menu-item-background: transparent;
 *   --dropdown-menu-item-background-hover: hsl(var(--contrast-100));
 *   --dropdown-menu-item-danger-background: hsl(var(--error));
 *   --dropdown-menu-item-danger-background-hover: color-mix(in oklab, hsl(var(--error)), white 75%);
 *   --dropdown-menu-item-font-family: var(--font-family-body);
 * }
 * ```
 */
export const DropdownMenu = ({
  className = '',
  items,
  open,
  onOpenChange,
  align = 'end',
  slideOffset = 6,
  children,
}: Props) => {
  return (
    <DropdownMenuPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DropdownMenuPrimitive.Trigger asChild>{children}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          className={clsx(
            'ring-contrast-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 max-h-80 max-w-lg overflow-y-auto rounded-2xl bg-[var(--dropdown-menu-background,hsl(var(--background)))] p-2 shadow-xl ring @4xl:w-32 @4xl:rounded-2xl @4xl:p-2',
            className,
          )}
          sideOffset={slideOffset}
        >
          {items.map((item, index) => {
            if (item === 'separator') {
              return (
                <DropdownMenuPrimitive.Separator
                  className="bg-contrast-100 my-1.5 h-[1px]"
                  key={`dropdown-separator-${index}`}
                />
              );
            }

            const {
              className: itemClassName = '',
              action,
              label,
              variant = 'default',
              disabled,
              asChild,
            } = item;

            const itemLabel =
              typeof action === 'string' && !disabled ? (
                <Link className="block" href={action}>
                  {label}
                </Link>
              ) : (
                label
              );

            const labelIsComponent = Boolean(
              itemLabel && typeof itemLabel === 'object' && 'props' in itemLabel,
            );

            return (
              <DropdownMenuPrimitive.Item
                asChild={asChild ?? labelIsComponent}
                className={clsx(
                  'data-disabled:bg-contrast-100/50 data-disabled:text-contrast-300/95 cursor-default rounded-lg bg-[var(--dropdown-menu-item-background,transparent)] px-3 py-2 font-[family-name:var(--dropdown-menu-item-font-family,var(--font-family-body))] text-sm font-medium outline-hidden transition-colors data-disabled:cursor-not-allowed',
                  {
                    default:
                      'text-[var(--dropdown-menu-item-text,hsl(var(--contrast-500)))] ring-[var(--dropdown-menu-item-focus,hsl(var(--primary)))] [&:not([data-disabled])]:hover:bg-[var(--dropdown-menu-item-background-hover,hsl(var(--contrast-100)))] [&:not([data-disabled])]:hover:text-[var(--dropdown-menu-item-text-hover,hsl(var(--foreground)))] [&:not([data-disabled])]:data-[highlighted]:bg-[var(--dropdown-menu-item-background-hover,hsl(var(--contrast-100)))] [&:not([data-disabled])]:data-[highlighted]:text-[var(--dropdown-menu-item-text-hover,hsl(var(--foreground)))]',
                    danger:
                      'text-[var(--dropdown-menu-item-danger-text,hsl(var(--error)))] ring-[var(--dropdown-menu-item-focus,hsl(var(--primary)))] [&:not([data-disabled])]:hover:bg-[var(--dropdown-menu-item-danger-background-hover,color-mix(in_oklab,_hsl(var(--error)),_white_75%))] [&:not([data-disabled])]:hover:text-[var(--dropdown-menu-item-danger-text-hover,color-mix(in_oklab,_hsl(var(--error)),_black_75%))] [&:not([data-disabled])]:data-[highlighted]:bg-[var(--dropdown-menu-item-danger-background-hover,color-mix(in_oklab,_hsl(var(--error)),_white_75%))] [&:not([data-disabled])]:data-[highlighted]:text-[var(--dropdown-menu-item-danger-text-hover,color-mix(in_oklab,_hsl(var(--error)),_black_75%))]',
                  }[variant],
                  itemClassName,
                )}
                disabled={disabled}
                key={`dropdown-item-${index}`}
                onClick={!disabled && action && typeof action === 'function' ? action : undefined}
              >
                {itemLabel}
              </DropdownMenuPrimitive.Item>
            );
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};
