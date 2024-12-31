'use client';

import * as AccordionsPrimitive from '@radix-ui/react-accordion';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --accordion-light-title-text: hsl(var(--contrast-400));
 *   --accordion-light-title-text-hover: hsl(var(--foreground));
 *   --accordion-light-title-icon: hsl(var(--contrast-500));
 *   --accordion-light-title-icon-hover: hsl(var(--foreground));
 *   --accordion-light-content-text: hsl(var(--foreground));
 *   --accordion-dark-title-text: hsl(var(--contrast-200));
 *   --accordion-dark-title-text-hover: hsl(var(--background));
 *   --accordion-dark-title-icon: hsl(var(--contrast-200));
 *   --accordion-dark-title-icon-hover: hsl(var(--background));
 *   --accordion-dark-content-text: hsl(var(--background));
 *   --accordion-title-font-family: var(--font-family-mono);
 *   --accordion-content-font-family: var(--font-family-body);
 * }
 * ```
 */
function Accordion({
  children,
  title,
  colorScheme = 'light',
  ...rest
}: React.ComponentPropsWithoutRef<typeof AccordionsPrimitive.Item> & {
  colorScheme?: 'light' | 'dark';
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <AccordionsPrimitive.Item {...rest}>
      <AccordionsPrimitive.Header>
        <AccordionsPrimitive.Trigger className="group flex w-full cursor-pointer items-start gap-8 py-3 text-start @md:py-4">
          <div
            className={clsx(
              'flex-1 select-none font-[family-name:var(--accordion-title-font-family,var(--font-family-mono))] text-sm uppercase transition-colors duration-300 ease-out',
              {
                light:
                  'text-[var(--accordion-light-title-text,hsl(var(--contrast-400)))] group-hover:text-[var(--accordion-light-title-text-hover,hsl(var(--foreground)))]',
                dark: 'text-[var(--accordion-dark-title-text,hsl(var(--contrast-200)))] group-hover:text-[var(--accordion-dark-title-text-hover,hsl(var(--background)))]',
              }[colorScheme],
            )}
          >
            {title}
          </div>
          <AnimatedChevron
            className={clsx(
              {
                light:
                  'stroke-[var(--accordion-light-title-icon,hsl(var(--contrast-500)))] group-hover:stroke-[var(--accordion-light-title-icon-hover,hsl(var(--foreground)))]',
                dark: 'stroke-[var(--accordion-dark-title-icon,hsl(var(--contrast-200)))] group-hover:stroke-[var(--accordion-dark-title-icon-hover,hsl(var(--background)))]',
              }[colorScheme],
            )}
          />
        </AccordionsPrimitive.Trigger>
      </AccordionsPrimitive.Header>
      <AccordionsPrimitive.Content
        className={clsx(
          'overflow-hidden',
          // We need to delay the animation until the component is mounted to avoid the animation
          // from being triggered when the component is first rendered.
          isMounted && 'data-[state=closed]:animate-collapse data-[state=open]:animate-expand',
        )}
      >
        <div
          className={clsx(
            'pb-5 font-[family-name:var(--accordion-content-font-family)] font-medium leading-normal',
            {
              light: 'text-[var(--accordion-light-content-text,hsl(var(--foreground)))]',
              dark: 'text-[var(--accordion-dark-content-text,hsl(var(--background)))]',
            }[colorScheme],
          )}
        >
          {children}
        </div>
      </AccordionsPrimitive.Content>
    </AccordionsPrimitive.Item>
  );
}

function AnimatedChevron({
  className,
  ...rest
}: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...rest}
      className={clsx(
        'mt-1 shrink-0 [&>line]:origin-center [&>line]:transition [&>line]:duration-300 [&>line]:ease-out',
        className,
      )}
      viewBox="0 0 10 10"
      width={16}
    >
      {/* Left Line of Chevron */}
      <line
        className="group-data-[state=open]:-translate-y-[3px] group-data-[state=open]:-rotate-90"
        strokeLinecap="round"
        x1={2}
        x2={5}
        y1={2}
        y2={5}
      />
      {/* Right Line of Chevron */}
      <line
        className="group-data-[state=open]:-translate-y-[3px] group-data-[state=open]:rotate-90"
        strokeLinecap="round"
        x1={8}
        x2={5}
        y1={2}
        y2={5}
      />
    </svg>
  );
}

const Accordions = AccordionsPrimitive.Root;

export { Accordions, Accordion };
