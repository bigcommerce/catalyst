'use client';

import * as AccordionsPrimitive from '@radix-ui/react-accordion';
import { clsx } from 'clsx';
import React from 'react';

function Accordion({
  children,
  title,
  colorScheme = 'light',
  ...rest
}: React.ComponentPropsWithoutRef<typeof AccordionsPrimitive.Item> & {
  colorScheme?: 'light' | 'dark';
}) {
  return (
    <AccordionsPrimitive.Item {...rest}>
      <AccordionsPrimitive.Header>
        <AccordionsPrimitive.Trigger asChild>
          <div className="group cursor-pointer items-start gap-8 py-3 last:flex @md:py-4">
            <div
              className={clsx(
                'flex-1 select-none font-[family-name:var(--accordion-title-font-family)] text-sm uppercase transition-colors duration-300 ease-out',
                {
                  light:
                    'text-[var(--accordion-light-title-text)] group-hover:text-[var(--accordion-light-title-text-hover)]',
                  dark: 'text-[var(--accordion-dark-title-text)] group-hover:text-[var(--accordion-dark-title-text-hover)]',
                }[colorScheme],
              )}
            >
              {title}
            </div>
            <AnimatedChevron
              className={clsx(
                {
                  light:
                    'stroke-[var(--accordion-light-title-icon)] group-hover:stroke-[var(--accordion-light-title-icon-hover)]',
                  dark: 'stroke-[var(--accordion-dark-title-icon)] group-hover:stroke-[var(--accordion-dark-title-icon-hover)]',
                }[colorScheme],
              )}
            />
          </div>
        </AccordionsPrimitive.Trigger>
      </AccordionsPrimitive.Header>
      <AccordionsPrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
        <div
          className={clsx(
            'pb-5 font-[family-name:var(--accordion-content-font-family)] font-medium leading-normal',
            {
              light: 'text-[var(--accordion-light-content-text)]',
              dark: 'text-[var(--accordion-dark-content-text)]',
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
