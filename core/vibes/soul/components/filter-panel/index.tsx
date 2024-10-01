'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import clsx from 'clsx';
import { Sliders, X } from 'lucide-react';
// import { useSearchParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import React, { startTransition, useMemo, useState } from 'react';

import { Accordions } from '@/vibes/soul/components/accordions';
import { Button } from '@/vibes/soul/components/button';
import { Chip } from '@/vibes/soul/components/chip';
import { Input } from '@/vibes/soul/components/input';
import { Rating } from '@/vibes/soul/components/rating';
import { SidePanel } from '@/vibes/soul/components/side-panel';
import { usePathname, useRouter } from '~/i18n/routing';

export type Filters = Array<
  | {
      type: 'other' | 'rating';
      name: string;
      title: string;
      defaultCollapsed?: boolean;
      options: Array<{
        label: string;
        value: string;
        amount?: number;
        key?: string;
        defaultSelected?: boolean;
      }>;
    }
  | {
      type: 'range';
      min: string;
      max: string;
      title: string;
      defaultCollapsed?: boolean;
      options: { min: { value: number | undefined }; max: { value: number | undefined } };
    }
>;

interface Props {
  filters: Filters;
}

export const FilterPanel = function FilterPanel({ filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();

  const defaultOptions = useMemo(
    () =>
      filters.reduce<Array<[string, string]>>((acc, filter) => {
        if (filter.type === 'range') {
          return acc;
        }

        return [
          ...acc,
          ...filter.options
            .filter(({ defaultSelected }) => defaultSelected === true)
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            .map(({ key, value }) => [key ?? filter.name, value] as [string, string]),
        ];
      }, []),
    [filters],
  );

  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedTags, setSelectedTags] = useState<Array<[string, string]>>(
    [
      ...Array.from(searchParams.entries()).filter(([key]) => key !== 'sort' && key !== 'term'),
      ...defaultOptions,
    ].filter(
      (item, index, self) =>
        index === self.findIndex(([key, value]) => key === item[0] && value === item[1]),
    ),
  );

  const clearAllFilters = () => {
    startTransition(() => {
      const sortParam = searchParams.get('sort');
      const searchParam = searchParams.get('term');

      const newSearchParams = new URLSearchParams();

      // We want to keep the sort param if it exists
      if (sortParam) {
        newSearchParams.append('sort', sortParam);
      }

      // We want to keep the search param if it exists
      if (searchParam) {
        newSearchParams.append('term', searchParam);
      }

      startTransition(() => {
        router.push(`${pathname}?${newSearchParams.toString()}`);
        setFilterOpen(false);
      });
    });
  };

  const showResults = () => {
    const sortParam = searchParams.get('sort');
    const searchParam = searchParams.get('term');
    const filteredSearchParams = Array.from(selectedTags)
      .filter((entry): entry is [string, string] => {
        return !(entry instanceof File);
      })
      .filter(([, value]) => value !== '');

    const newSearchParams = new URLSearchParams(filteredSearchParams);

    // We want to keep the sort param if it exists
    if (sortParam) {
      newSearchParams.append('sort', sortParam);
    }

    // We want to keep the search param if it exists
    if (searchParam) {
      newSearchParams.append('term', searchParam);
    }

    startTransition(() => {
      router.push(`${pathname}?${newSearchParams.toString()}`);
      setFilterOpen(false);
    });
  };

  const openedFilters = useMemo(() => {
    return filters
      .map((filter, index) => {
        if (!filter.defaultCollapsed) {
          return (index + 1).toString();
        }

        return null;
      })
      .filter((index): index is string => index !== null);
  }, [filters]);

  const accordions = useMemo(
    () =>
      filters.map((filter) => {
        if (filter.type === 'range') {
          return {
            title: filter.title,
            content: (
              <div className="flex w-[48%] gap-2">
                <Input
                  defaultValue={filter.options.min.value}
                  onChange={(e) => {
                    setSelectedTags([
                      ...selectedTags.filter(([tagKey]) => !(tagKey === filter.min)),
                      [filter.min, e.target.value],
                    ]);
                  }}
                  prepend="$"
                />
                <Input
                  defaultValue={filter.options.max.value}
                  onChange={(e) => {
                    setSelectedTags([
                      ...selectedTags.filter(([tagKey]) => !(tagKey === filter.max)),
                      [filter.max, e.target.value],
                    ]);
                  }}
                  prepend="$"
                />
              </div>
            ),
          };
        }

        if (filter.type === 'rating') {
          return {
            title: filter.title,
            content: (
              <div className="flex flex-wrap gap-2">
                {Boolean(filter.options.length) &&
                  filter.options.map(({ label, value, key, defaultSelected }, index) => {
                    const isFilterSelected = selectedTags.some(
                      ([tagKey, tagValue]) =>
                        (tagKey === filter.name || tagKey === key) && tagValue === value,
                    );

                    return (
                      <button
                        className={clsx(
                          'whitespace-nowrap rounded-full px-2 py-1 text-sm font-normal',
                          'ring-primary focus-visible:outline-0 focus-visible:ring-2',
                          'border border-transparent transition-colors',
                          defaultSelected || isFilterSelected
                            ? 'bg-foreground text-background'
                            : 'bg-contrast-100 hover:border-contrast-300',
                        )}
                        key={index}
                        onClick={() => {
                          if (isFilterSelected) {
                            setSelectedTags(
                              selectedTags.filter(
                                ([tagKey, tagValue]) =>
                                  !(
                                    (tagKey === filter.name || tagKey === key) &&
                                    tagValue === value
                                  ),
                              ),
                            );
                          } else {
                            setSelectedTags([...selectedTags, [key ?? filter.name, value]]);
                          }
                        }}
                      >
                        <span className="sr-only">{label}</span>
                        <Rating rating={parseInt(value, 10)} />
                        {/* TODO: add amount */}
                        {/* <span className="text-contrast-300">{amount}</span> */}
                      </button>
                    );
                  })}
              </div>
            ),
          };
        }

        return {
          title: filter.title,
          content: (
            <div className="flex flex-wrap gap-2">
              {Boolean(filter.options.length) &&
                filter.options.map(({ label, value, amount, key }, index) => {
                  const isFilterSelected = selectedTags.some(
                    ([tagKey, tagValue]) => tagKey === filter.name && tagValue === value,
                  );

                  return (
                    <Chip
                      amount={amount}
                      key={index}
                      label={label}
                      onClick={() => {
                        if (isFilterSelected) {
                          setSelectedTags(
                            selectedTags.filter(
                              ([tagKey, tagValue]) =>
                                !((tagKey === filter.name || tagKey === key) && tagValue === value),
                            ),
                          );
                        } else {
                          setSelectedTags([...selectedTags, [key ?? filter.name, value]]);
                        }
                      }}
                      selected={isFilterSelected}
                    />
                  );
                })}
            </div>
          ),
        };
      }),
    [filters, selectedTags],
  );

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
            <Accordions accordions={accordions} className="mt-10" defaultValue={openedFilters} />

            <div className="mt-auto flex justify-center gap-2 pt-10">
              <form action={showResults}>
                <Button type="submit" variant="secondary">
                  Show results
                </Button>
              </form>

              <Button onClick={clearAllFilters} variant="tertiary">
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
