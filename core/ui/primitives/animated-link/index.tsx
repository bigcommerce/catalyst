import { clsx } from 'clsx';
import { ComponentPropsWithoutRef } from 'react';

import { Link } from '~/components/link';

export interface AnimatedLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  className?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --animated-link-text: hsl(var(--foreground));
 *   --animated-link-font-family: var(--font-family-body);
 *   --animated-link-underline-hover: hsl(var(--primary));
 * }
 * ```
 */
export function AnimatedLink({ className, children, href, ...props }: AnimatedLinkProps) {
  return (
    <Link
      {...props}
      className={clsx(
        'origin-left font-[family-name:var(--animated-link-font-family,var(--font-family-body))] leading-normal font-semibold text-[var(--animated-link-text,hsl(var(--foreground)))] transition-[background-size] duration-300 [background:linear-gradient(0deg,var(--animated-link-underline-hover,hsl(var(--primary))),var(--animated-link-underline-hover,hsl(var(--primary))))_no-repeat_left_bottom_/_0_2px] hover:bg-[size:100%_2px] focus:outline-hidden focus-visible:bg-[size:100%_2px]',
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
