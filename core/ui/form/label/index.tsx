import * as LabelPrimitive from '@radix-ui/react-label';
import { clsx } from 'clsx';
import { ComponentPropsWithoutRef } from 'react';

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *    --label-light-text: hsl(var(--contrast-500));
 *    --label-dark-text: hsl(var(--contrast-100));
 *  }
 * ```
 */
export function Label({
  className,
  colorScheme = 'light',
  ...rest
}: ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { colorScheme?: 'light' | 'dark' }) {
  return (
    <LabelPrimitive.Root
      {...rest}
      className={clsx(
        'block font-mono text-xs uppercase',
        {
          light: 'text-[var(--label-light-text,hsl(var(--contrast-500)))]',
          dark: 'text-[var(--label-dark-text,hsl(var(--contrast-100)))]',
        }[colorScheme],
        className,
      )}
    />
  );
}
