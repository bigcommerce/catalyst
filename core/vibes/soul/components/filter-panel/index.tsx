'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Sliders, X } from 'lucide-react';
import React, { useState } from 'react';

import { Accordions } from '@/vibes/soul/components/accordions';
import { Button } from '@/vibes/soul/components/button';
import { Chip } from '@/vibes/soul/components/chip';
import { Input } from '@/vibes/soul/components/input';
import { SidePanel } from '@/vibes/soul/components/side-panel';

const sizingFilters = [
  {
    label: 'X-Large',
    amount: 25,
  },
  {
    label: 'Large',
    amount: 25,
  },
  {
    label: 'Medium',
    amount: 25,
  },
  {
    label: 'Small',
    amount: 25,
  },
  {
    label: 'X-Small',
    amount: 25,
  },
];
const colorFilters = [
  {
    label: 'Black',
    amount: 25,
  },
  {
    label: 'Green',
    amount: 25,
  },
  {
    label: 'Blue',
    amount: 25,
  },
  {
    label: 'Yellow',
    amount: 25,
  },
  {
    label: 'Red',
    amount: 25,
  },
  {
    label: 'White',
    amount: 25,
  },
];

export const FilterPanel = function FilterPanel() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <SidePanel
      content={
        <>
          <VisuallyHidden.Root>
            <Dialog.Title className="DialogTitle">Filter</Dialog.Title>
          </VisuallyHidden.Root>
          <div>
            <div className="flex items-center justify-between">
              <h2 className="flex gap-2 text-xl font-medium @lg:text-2xl">
                Filters
                {selectedTags.length > 0 && (
                  <span className="text-contrast-300">{selectedTags.length} applied</span>
                )}
              </h2>
              <Button
                asChild
                className="-mr-2 [&_div]:!px-1"
                onClick={() => setFilterOpen(false)}
                size="small"
                variant="tertiary"
              >
                <div>
                  <X className="text-background" size={18} strokeWidth={1.5} />
                </div>
              </Button>
            </div>
            <Accordions
              className="mt-10"
              defaultValue={['1', '2', '3']}
              // TODO: filters should be customizable
              accordions={[
                {
                  title: 'sizing',
                  content: (
                    <div className="flex flex-wrap gap-2">
                      {Boolean(sizingFilters.length) &&
                        sizingFilters.map(({ label, amount }, index) => {
                          return (
                            <Chip
                              key={index}
                              label={label}
                              amount={amount}
                              onClick={() =>
                                setSelectedTags(
                                  prev =>
                                    prev.includes(label)
                                      ? prev.filter(tag => tag !== label) // Remove the label if it's already in the array
                                      : [...prev, label] // Add the label if it's not in the array
                                )
                              }
                              selected={selectedTags.includes(label)}
                            />
                          )
                        })}
                    </div>
                  ),
                },
                {
                  title: 'color',
                  content: (
                    <div className="flex flex-wrap gap-2">
                      {Boolean(colorFilters.length) &&
                        colorFilters.map(({ label, amount }, index) => {
                          return (
                            <Chip
                              key={index}
                              label={label}
                              amount={amount}
                              onClick={() =>
                                setSelectedTags(
                                  prev =>
                                    prev.includes(label)
                                      ? prev.filter(tag => tag !== label) // Remove the label if it's already in the array
                                      : [...prev, label] // Add the label if it's not in the array
                                )
                              }
                              selected={selectedTags.includes(label)}
                            />
                          )
                        })}
                    </div>
                  ),
                },
                {
                  title: 'pricing',
                  content: (
                    <div className="flex w-[48%] gap-2">
                      <Input prepend="$" />
                      <Input prepend="$" />
                    </div>
                  ),
                },
              ]}
            />

            <div className="mt-auto flex justify-center gap-2 pt-10">
              <Button onClick={() => setFilterOpen(false)} variant="secondary">
                Show 25 Results
              </Button>
              <Button onClick={() => setSelectedTags([])} variant="tertiary">
                Reset
              </Button>
            </div>
          </div>
        </>
      }
      isOpen={filterOpen}
      setOpen={setFilterOpen}
      trigger={
        <Button asChild size="small" variant="secondary">
          <div className="flex gap-2">
            <span className="hidden @xl:block">Filter</span>
            <Sliders size={18} />
          </div>
        </Button>
      }
    />
  );
};
