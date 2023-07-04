import React, { ReactNode, useState } from 'react';

import Link from 'next/link';
import { ChevronDown, X } from 'lucide-react';

import clsx from 'clsx';

import * as Accordion from '@radix-ui/react-accordion';

import { CheckboxFilter } from '../CheckboxFilter';
import { ReviewRating } from '../ReviewRating';
import { Button } from '../Button';

function Tag({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-10 bg-gray-100">
      <div className="self-center pl-4 pr-2 text-base font-semibold">{children}</div>
      <button className="p-3 hover:bg-gray-200">
        <X size={16} />
      </button>
    </div>
  );
}

function AccordionItem({ value, children }: { value: string; children: ReactNode }) {
  return <Accordion.Item value={value}>{children}</Accordion.Item>;
}

function AccordionTrigger({ children }: { children: ReactNode }) {
  return (
    <Accordion.Trigger className="group flex w-full py-2 text-left text-base font-bold leading-snug">
      <span className="block flex-1">{children}</span>
      <ChevronDown className="group-data-[state=open]:rotate-180" />
    </Accordion.Trigger>
  );
}

function AccordionContent({ children }: { children: ReactNode }) {
  return (
    <Accordion.Content className="max-h-auto overflow-auto pr-0 lg:max-h-[280px] lg:pr-6">
      {children}
    </Accordion.Content>
  );
}

export function Filters() {
  const [filterCategoryOpen, setFilterCategoryOpen] = useState(['brand', 'size']);
  const [filterListOpen, setFilterListOpen] = useState(false);
  return (
    <div
      className={clsx(
        'm:h-auto fixed inset-y-0 left-0 z-20 box-border w-full overflow-auto bg-white p-10 transition-transform sm:box-content sm:w-72 lg:static lg:p-0',
        filterListOpen
          ? 'translate-x-0 shadow-xl lg:shadow-none'
          : '-translate-x-full shadow-none lg:translate-x-0',
      )}
    >
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <div className="text-h4">Filters</div>
        <button aria-label="Close filters" onClick={() => setFilterListOpen(false)}>
          <X />
        </button>
      </div>
      <div className="mb-2 text-h5 font-bold leading-normal">Categories</div>
      <ul className="mb-8">
        <li className="py-2">
          <Link href="" className="block text-base hover:text-blue-primary">
            Bags
          </Link>
        </li>
        <li className="py-2">
          <Link href="" className="block text-base hover:text-blue-primary">
            Hats
          </Link>
        </li>
        <li className="py-2">
          <Link href="" className="block text-base hover:text-blue-primary">
            Sunglasses
          </Link>
        </li>
        <li className="py-2">
          <Link href="" className="block text-base hover:text-blue-primary">
            Watches
          </Link>
        </li>
      </ul>

      <div className="mb-4 flex items-end">
        <h2 className="flex-1 text-h5 font-bold leading-normal">Refine by</h2>
        <button className="text-base font-semibold text-blue-primary">Clear all</button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Tag>Base London</Tag>
        <Tag>M</Tag>
        <Tag>Rating 3 & up</Tag>
        <Tag>200mm</Tag>
      </div>

      <Accordion.Root
        type="multiple"
        value={filterCategoryOpen}
        onValueChange={setFilterCategoryOpen}
        className="w-full space-y-4"
      >
        <AccordionItem value="brand">
          <AccordionTrigger>Brand</AccordionTrigger>
          <AccordionContent>
            <CheckboxFilter count={1} id="1">
              Adidas
            </CheckboxFilter>
            <CheckboxFilter count={11} id="2">
              Bonobos
            </CheckboxFilter>
            <CheckboxFilter count={3} id="3">
              This is an example with a really long name
            </CheckboxFilter>
            <CheckboxFilter count={3} id="4">
              Nike
            </CheckboxFilter>
            <CheckboxFilter count={5} id="5">
              Puma
            </CheckboxFilter>
            <CheckboxFilter count={3} id="6">
              Reebok
            </CheckboxFilter>
            <CheckboxFilter count={3} id="7">
              Polo
            </CheckboxFilter>
            <CheckboxFilter count={3} id="8">
              Ralph Lauren
            </CheckboxFilter>
            <CheckboxFilter count={3} id="9">
              Polo
            </CheckboxFilter>
            <CheckboxFilter count={3} id="10">
              Polo
            </CheckboxFilter>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger>Size</AccordionTrigger>
          <AccordionContent>
            <CheckboxFilter count={1} id="s">
              S
            </CheckboxFilter>
            <CheckboxFilter count={1} id="m">
              M
            </CheckboxFilter>
            <CheckboxFilter count={1} id="l">
              L
            </CheckboxFilter>
            <CheckboxFilter count={1} id="xl">
              XL
            </CheckboxFilter>
            <CheckboxFilter count={1} id="xxl">
              XXL
            </CheckboxFilter>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Rating</AccordionTrigger>
          <AccordionContent>
            <button className="flex items-center py-2 [&_.rr--on>svg]:hover:fill-blue-primary [&_.rr--on>svg]:hover:stroke-blue-primary [&_.rr--off>svg]:hover:stroke-blue-primary">
              <ReviewRating stars={4} />
              <span className="ml-2">& up</span>
              <span className="ml-3 text-gray-500">2</span>
            </button>
            <button className="flex items-center py-2 [&_.rr--on>svg]:hover:fill-blue-primary [&_.rr--on>svg]:hover:stroke-blue-primary [&_.rr--off>svg]:hover:stroke-blue-primary">
              <ReviewRating stars={3} />
              <span className="ml-2">& up</span>
              <span className="ml-3 text-gray-500">5</span>
            </button>
            <button className="flex items-center py-2 [&_.rr--on>svg]:hover:fill-blue-primary [&_.rr--on>svg]:hover:stroke-blue-primary [&_.rr--off>svg]:hover:stroke-blue-primary">
              <ReviewRating stars={2} />
              <span className="ml-2">& up</span>
              <span className="ml-3 text-gray-500">15</span>
            </button>
            <button className="flex items-center py-2 [&_.rr--on>svg]:hover:fill-blue-primary [&_.rr--on>svg]:hover:stroke-blue-primary [&_.rr--off>svg]:hover:stroke-blue-primary">
              <ReviewRating stars={1} />
              <span className="ml-2">& up</span>
              <span className="ml-3 text-gray-500">8</span>
            </button>
          </AccordionContent>
        </AccordionItem>
      </Accordion.Root>
    </div>
  );
}
