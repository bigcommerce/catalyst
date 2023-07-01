import React, { ComponentPropsWithoutRef, ReactNode, useState } from 'react';

import Link from 'next/link';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

import clsx from 'clsx';

import * as Accordion from '@radix-ui/react-accordion';
import * as Form from '@radix-ui/react-form';

import { SelectMenu } from '../SelectMenu';
import { Warning } from '../Warning';
import { ProductCard } from '../ProductCard';
import { CheckboxFilter } from '../CheckboxFilter';
import { ReviewRating } from '../ReviewRating';
import { Button } from '../Button';

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
    <Accordion.Trigger className="group flex w-full py-2 text-left text-base font-bold leading-snug">
      <span className="block flex-1">{children}</span>
      <ChevronDown className="group-data-[state=open]:rotate-180" />
    </Accordion.Trigger>
  );
}

function AccordionContent({ className, children }: { className?: string; children: ReactNode }) {
  return <Accordion.Content className={clsx(className)}>{children}</Accordion.Content>;
}

export function ProductList({ className, title = 'Accessories', cards }: Props) {
  const [filterCategoryOpen, setFilterCategoryOpen] = useState(['brand', 'size']);
  const [filterListOpen, setFilterListOpen] = useState(false);
  return (
    <div className={className}>
      <div className="mb-8 flex flex-col items-center justify-start gap-x-8 gap-y-6 lg:flex-row">
        <h1 className="m-0 w-full flex-1 text-h2 font-black leading-snug">{title}</h1>

        <div className="flex w-full flex-col items-center justify-between gap-x-8 gap-y-3 sm:flex-row lg:justify-end">
          <Button
            icon="filter"
            variant="secondary"
            onClick={() => setFilterListOpen(true)}
            className="w-full sm:w-auto lg:hidden"
          >
            Show filters
          </Button>

          <div className="flex w-full flex-col items-center gap-x-8 gap-y-8 sm:w-auto sm:flex-row">
            <p className="order-last w-full font-bold sm:order-first sm:w-auto">1-9 of 235 items</p>

            <SelectMenu
              value="featured"
              options={[
                { value: 'featured', label: 'Featured' },
                { value: 'price-descending', label: 'Price (high to low)' },
                { value: 'price-ascending', label: 'Price (low to high' },
                { value: 'newest', label: 'Newest' },
              ]}
              className="w-full sm:w-56"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
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
              <AccordionContent className="max-h-auto overflow-auto pr-6 lg:max-h-[280px]">
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

            <AccordionItem value="price">
              <AccordionTrigger>Price</AccordionTrigger>
              <AccordionContent>
                <Form.Root className="box-border w-full px-1 py-2">
                  <div className="mb-4 flex w-full gap-x-4">
                    <Form.Field className="" name="price-min">
                      <Form.Control asChild>
                        <input
                          className="h-12 w-full truncate border-2 border-gray-200 bg-white px-4 text-left leading-none text-black outline-none ring-4 ring-transparent hover:border-blue-primary focus:border-blue-primary focus:ring-blue-primary/20 data-[placeholder]:text-black"
                          type="number"
                          placeholder="$ min"
                        />
                      </Form.Control>
                    </Form.Field>

                    <Form.Field className="" name="price-min">
                      <Form.Control asChild>
                        <input
                          className="h-12 w-full truncate border-2 border-gray-200 bg-white px-4 text-left leading-none text-black outline-none ring-4 ring-transparent hover:border-blue-primary focus:border-blue-primary focus:ring-blue-primary/20 data-[placeholder]:text-black"
                          type="number"
                          placeholder="$ max"
                        />
                      </Form.Control>
                    </Form.Field>
                  </div>

                  <Form.Submit asChild>
                    <Button variant="secondary" className="w-full">
                      Update price
                    </Button>
                  </Form.Submit>
                </Form.Root>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="color">
              <AccordionTrigger>Color</AccordionTrigger>
              <AccordionContent></AccordionContent>
            </AccordionItem>
          </Accordion.Root>
        </div>

        <div className="flex-1">
          {!cards.length ? (
            <Warning>No products were found</Warning>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 md:gap-x-8">
              {cards.map((card, index) => (
                <ProductCard {...card} key={index} />
              ))}
            </div>
          )}

          {!!cards.length && (
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
          )}
        </div>
      </div>
    </div>
  );
}
