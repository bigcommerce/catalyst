'use client';

import * as AccordionsPrimitive from '@radix-ui/react-accordion';
import React from 'react';

function Accordion({
  children,
  title,
  ...rest
}: React.ComponentPropsWithoutRef<typeof AccordionsPrimitive.Item>) {
  return (
    <AccordionsPrimitive.Item {...rest}>
      <AccordionsPrimitive.Header className='bg-[#F3F4F5] p-[10px_20px] min-h-[50px] flex items-center'>
        <AccordionsPrimitive.Trigger asChild>
          <div className="group w-full cursor-pointer items-center gap-8 last:flex @md:py-4">
            <div className="flex-1 select-none font-['Open_Sans'] text-[16px] leading-[32px] tracking-[0.15px] text-[#353535] font-bold transition-colors duration-300 ease-out group-hover:text-foreground">
              {title}
            </div>
            <AnimatedChevron />
          </div>
        </AccordionsPrimitive.Trigger>
      </AccordionsPrimitive.Header>
      <AccordionsPrimitive.Content className="data-[state=closed]:animate-collapse data-[state=open]:animate-expand w-full overflow-hidden">
        <div className="w-full pb-5 pt-5 font-body font-normal text-[16px] leading-[32px] tracking-[0.5px] text-[#353535]">
          {children}
        </div>
      </AccordionsPrimitive.Content>
    </AccordionsPrimitive.Item>
  );
}

function AnimatedChevron(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="mt-1 shrink-0 [&>line]:origin-center [&>line]:transition [&>line]:duration-300 [&>line]:ease-out [&>line]:group-hover:stroke-foreground"
      viewBox="0 0 10 10"
      width={17}
      {...props}
    >
      {/* Left Line of Chevron */}
      <line
        className="group-data-[state=open]:-translate-y-[3px] group-data-[state=open]:-rotate-90"
        stroke="currentColor"
        strokeLinecap="round"
        x1={2}
        x2={5}
        y1={2}
        y2={5}
      />
      {/* Right Line of Chevron */}
      <line
        className="group-data-[state=open]:-translate-y-[3px] group-data-[state=open]:rotate-90"
        stroke="currentColor"
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
