import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

import Link from 'next/link';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

import clsx from 'clsx';

import * as Accordion from '@radix-ui/react-accordion';

import { SelectMenu } from '../SelectMenu';
import { Warning } from '../Warning';
import { ProductCard } from '../ProductCard';

type CardProps = ComponentPropsWithoutRef<typeof ProductCard>;

interface Props {
  className?: string;
  title?: string;
  cards: Array<Omit<CardProps, 'className'>>;
}

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
    <Accordion.Trigger className="">
      {children}
      <ChevronDown className="" />
    </Accordion.Trigger>
  );
}

function AccordionContent({ children }: { children: ReactNode }) {
  return <Accordion.Content className="">{children}</Accordion.Content>;
}

export function ProductList({ className, title = 'Accessories', cards }: Props) {
  return (
    <div className={className}>
      <div className="mb-8 flex items-center space-x-8">
        <h1 className="m-0 flex-1 text-h2 font-black leading-snug">{title}</h1>

        <p className="font-bold">1-9 of 235 items</p>

        <SelectMenu
          placeholder="Select one"
          options={[
            { value: 'featured', label: 'Featured' },
            { value: 'price-descending', label: 'Price (high to low)' },
            { value: 'price-ascending', label: 'Price (low to high' },
            { value: 'newest', label: 'Newest' },
          ]}
          className="w-56"
        />
      </div>

      <div className="flex gap-8">
        <div className="w-72">
          <h2 className="mb-2 text-h5 font-bold leading-normal">Categories</h2>
          <ul className="mb-8">
            <li className="py-2">
              <Link href="" className="block text-base">
                Bags
              </Link>
            </li>
            <li className="py-2">
              <Link href="" className="block text-base">
                Hats
              </Link>
            </li>
            <li className="py-2">
              <Link href="" className="block text-base">
                Sunglasses
              </Link>
            </li>
            <li className="py-2">
              <Link href="" className="block text-base">
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

          <Accordion.Root type="multiple" className="space-y-4">
            <AccordionItem value="brand">
              <AccordionTrigger>Brand</AccordionTrigger>
              <AccordionContent>More things</AccordionContent>
            </AccordionItem>

            <AccordionItem value="size">
              <AccordionTrigger>Size</AccordionTrigger>
              <AccordionContent>More things</AccordionContent>
            </AccordionItem>
          </Accordion.Root>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3">
            {cards.map((card, index) => (
              <ProductCard {...card} key={index} />
            ))}
          </div>

          <div className="mt-10 flex w-full items-center justify-center gap-x-10">
            <button className="p-3">
              <ChevronLeft className="stroke-gray-400" />
            </button>

            <div className="flex gap-x-2">
              <button className="inline-block h-12 w-12 self-center justify-self-center border-2 border-blue-primary text-center text-base font-semibold text-blue-primary">
                1
              </button>
              <button className="inline-block h-12 w-12 self-center justify-self-center border-2 border-transparent text-center text-base font-semibold text-blue-primary">
                2
              </button>
              <button className="inline-block h-12 w-12 self-center justify-self-center border-2 border-transparent text-center text-base font-semibold text-blue-primary">
                3
              </button>
            </div>

            <button className="p-3">
              <ChevronRight className="stroke-blue-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
