import { clsx } from 'clsx';

export interface AnimatedUnderlineProps {
  children: string;
  className?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --animated-underline-hover: hsl(var(--primary));
 *   --animated-underline-text: hsl(var(--foreground));
 *   --animated-underline-font-family: var(--font-family-body);
 * }
 * ```
 */
export function AnimatedUnderline({ className, children }: AnimatedUnderlineProps) {
  return (
    <span
      className={clsx(
        'origin-left font-[family-name:var(--animated-underline-font-family,var(--font-family-body))] font-semibold leading-normal text-[var(--animated-underline-text,hsl(var(--foreground)))] transition-[background-size] duration-300 [background:linear-gradient(0deg,var(--animated-underline-hover,hsl(var(--primary))),var(--animated-underline-hover,hsl(var(--primary))))_no-repeat_left_bottom_/_0_2px] hover:bg-[size:100%_2px] group-focus/underline:bg-[size:100%_2px]',
        className,
      )}
    >
      {children}
    </span>
  );
}
