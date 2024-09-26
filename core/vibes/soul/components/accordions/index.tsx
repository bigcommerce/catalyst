'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { clsx } from 'clsx';
import React, { forwardRef, ReactNode, Ref } from 'react';

export interface AccordionItem {
  title: ReactNode;
  content: ReactNode;
}

interface Props {
  className?: string;
  accordions: AccordionItem[];
  defaultValue?: string[];
}

export const Accordions = forwardRef(function Accordions(
  { className, accordions, defaultValue }: Props,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <Accordion.Root
      asChild
      className={className}
      defaultValue={defaultValue}
      ref={ref}
      type="multiple"
    >
      <ul className="w-full @container">
        {accordions.map((accordion, i) => (
          <Accordion.Item asChild key={i} value={`${i + 1}`}>
            <li className="group">
              <Accordion.Header>
                <Accordion.Trigger asChild>
                  <div className="flex w-full cursor-pointer items-start py-3 @md:gap-8 @md:py-5">
                    <h3 className="mr-8 flex-1 select-none font-mono text-sm uppercase text-contrast-400 transition-colors duration-300 ease-out group-hover:text-foreground">
                      {accordion.title}
                    </h3>
                    <Chevron />
                  </div>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="data-[state=closed]:animate-collapse data-[state=open]:animate-expand w-full overflow-hidden">
                <div
                  className={clsx(
                    'py-4 font-heading text-xl font-medium leading-tight text-foreground @md:text-2xl',
                    typeof accordion.content === 'string' ? '@md:w-5/6 @lg:w-3/4' : 'w-full',
                  )}
                >
                  {accordion.content}
                </div>
              </Accordion.Content>
            </li>
          </Accordion.Item>
        ))}
      </ul>
    </Accordion.Root>
  );
});

function Chevron(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="mt-1 shrink-0 [&>line]:origin-center [&>line]:stroke-contrast-300 [&>line]:transition [&>line]:duration-300 [&>line]:ease-out [&>line]:group-hover:stroke-foreground"
      viewBox="0 0 10 10"
      width="16"
      {...props}
    >
      {/* Left Line of Chevron */}
      <line
        className="group-data-[state=open]:-translate-y-[3px] group-data-[state=open]:-rotate-90"
        stroke="currentColor"
        strokeLinecap="round"
        x1="2"
        x2="5"
        y1="2"
        y2="5"
      />
      {/* Right Line of Chevron */}
      <line
        className="group-data-[state=open]:-translate-y-[3px] group-data-[state=open]:rotate-90"
        stroke="currentColor"
        strokeLinecap="round"
        x1="8"
        x2="5"
        y1="2"
        y2="5"
      />
    </svg>
  );
}
