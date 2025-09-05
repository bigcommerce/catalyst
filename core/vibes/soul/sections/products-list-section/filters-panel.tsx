/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import { clsx } from 'clsx';
import { parseAsString, useQueryStates } from 'nuqs';
import { Suspense, useOptimistic, useState, useTransition } from 'react';

import { Checkbox } from '@/vibes/soul/form/checkbox';
import { RangeInput } from '@/vibes/soul/form/range-input';
import { ToggleGroup } from '@/vibes/soul/form/toggle-group';
import { Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
import { Accordion, AccordionItem } from '@/vibes/soul/primitives/accordion';
import { Button } from '@/vibes/soul/primitives/button';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Rating } from '@/vibes/soul/primitives/rating';
import { Link } from '~/components/link';

import { getFilterParsers } from './filter-parsers';

export interface LinkGroupFilter {
  type: 'link-group';
  label: string;
  links: Array<{ label: string; href: string }>;
}

export interface ToggleGroupFilter {
  type: 'toggle-group';
  paramName: string;
  label: string;
  options: Array<{ label: string; value: string; disabled?: boolean }>;
}

export interface RatingFilter {
  type: 'rating';
  paramName: string;
  label: string;
  disabled?: boolean;
}

export interface RangeFilter {
  type: 'range';
  label: string;
  minParamName: string;
  maxParamName: string;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  minPrepend?: React.ReactNode;
  maxPrepend?: React.ReactNode;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  disabled?: boolean;
}

export type Filter = ToggleGroupFilter | RangeFilter | RatingFilter | LinkGroupFilter;

interface Props {
  className?: string;
  filters: Streamable<Filter[]>;
  resetFiltersLabel?: Streamable<string>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  rangeFilterApplyLabel?: Streamable<string>;
}

function getParamCountLabel(params: Record<string, string | null | string[]>, key: string) {
  const value = params[key];

  if (Array.isArray(value) && value.length > 0) return `(${value.length})`;

  return '';
}

export function FiltersPanel({
  className,
  filters,
  resetFiltersLabel,
  rangeFilterApplyLabel,
}: Props) {
  return (
    <Suspense fallback={<FiltersSkeleton />}>
      <FiltersPanelInner
        className={className}
        filters={filters}
        rangeFilterApplyLabel={rangeFilterApplyLabel}
        resetFiltersLabel={resetFiltersLabel}
      />
    </Suspense>
  );
}

function FiltersPanelInner({
  className,
  filters: streamableFilters,
  resetFiltersLabel: streamableResetFiltersLabel,
  rangeFilterApplyLabel: streamableRangeFilterApplyLabel,
  paginationInfo: streamablePaginationInfo,
}: Props) {
  const filters = useStreamable(streamableFilters);
  const resetFiltersLabel = useStreamable(streamableResetFiltersLabel) ?? 'Reset filters';
  const rangeFilterApplyLabel = useStreamable(streamableRangeFilterApplyLabel);
  const paginationInfo = useStreamable(streamablePaginationInfo);
  const startCursorParamName = paginationInfo?.startCursorParamName ?? 'before';
  const endCursorParamName = paginationInfo?.endCursorParamName ?? 'after';
  const [params, setParams] = useQueryStates(
    {
      ...getFilterParsers(filters),
      [startCursorParamName]: parseAsString,
      [endCursorParamName]: parseAsString,
    },
    {
      shallow: false,
      history: 'push',
    },
  );
  const [isPending, startTransition] = useTransition();
  const [optimisticParams, setOptimisticParams] = useOptimistic(params);
  const [accordionItems, setAccordionItems] = useState(() =>
    filters
      .filter((filter) => filter.type !== 'link-group')
      .map((filter, index) => ({
        key: index.toString(),
        value: index.toString(),
        filter,
        expanded: index < 3,
      })),
  );

  if (filters.length === 0) return null;

  const linkGroupFilters = filters.filter(
    (filter): filter is LinkGroupFilter => filter.type === 'link-group',
  );

  return (
    <div className={clsx('space-y-5', className)} data-pending={isPending ? true : null}>
      {linkGroupFilters.map((linkGroup, index) => (
        <div key={index.toString()}>
          <h3 className="py-4 font-mono text-sm uppercase text-contrast-400">{linkGroup.label}</h3>
          <ul>
            {linkGroup.links.map((link, linkIndex) => (
              <li className="py-2" key={linkIndex.toString()}>
                <Link
                  className="font-body text-base font-medium text-contrast-500 transition-colors duration-300 ease-out hover:text-foreground"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Accordion
        onValueChange={(items) =>
          setAccordionItems((prevItems) =>
            prevItems.map((prevItem) => ({
              ...prevItem,
              expanded: items.includes(prevItem.value),
            })),
          )
        }
        type="multiple"
        value={accordionItems.filter((item) => item.expanded).map((item) => item.value)}
      >
        {accordionItems.map((accordionItem) => {
          const { key, value, filter } = accordionItem;

          switch (filter.type) {
            case 'toggle-group':
              return (
                <AccordionItem
                  key={key}
                  title={`${filter.label}${getParamCountLabel(optimisticParams, filter.paramName)}`}
                  value={value}
                >
                  <ToggleGroup
                    onValueChange={(toggleGroupValues) => {
                      startTransition(async () => {
                        const nextParams = {
                          ...optimisticParams,
                          [startCursorParamName]: null,
                          [endCursorParamName]: null,
                          [filter.paramName]:
                            toggleGroupValues.length === 0 ? null : toggleGroupValues,
                        };

                        setOptimisticParams(nextParams);
                        await setParams(nextParams);
                      });
                    }}
                    options={filter.options}
                    type="multiple"
                    value={optimisticParams[filter.paramName] ?? []}
                  />
                </AccordionItem>
              );

            case 'range':
              return (
                <AccordionItem key={key} title={filter.label} value={value}>
                  <RangeInput
                    applyLabel={rangeFilterApplyLabel}
                    disabled={filter.disabled}
                    max={filter.max}
                    maxLabel={filter.maxLabel}
                    maxName={filter.maxParamName}
                    maxPlaceholder={filter.maxPlaceholder}
                    maxPrepend={filter.maxPrepend}
                    min={filter.min}
                    minLabel={filter.minLabel}
                    minName={filter.minParamName}
                    minPlaceholder={filter.minPlaceholder}
                    minPrepend={filter.minPrepend}
                    onChange={({ min, max }) => {
                      startTransition(async () => {
                        const nextParams = {
                          ...optimisticParams,
                          [filter.minParamName]: min,
                          [filter.maxParamName]: max,
                          [startCursorParamName]: null,
                          [endCursorParamName]: null,
                        };

                        setOptimisticParams(nextParams);
                        await setParams(nextParams);
                      });
                    }}
                    value={{
                      min: optimisticParams[filter.minParamName] ?? null,
                      max: optimisticParams[filter.maxParamName] ?? null,
                    }}
                  />
                </AccordionItem>
              );

            case 'rating':
              return (
                <AccordionItem key={key} title={filter.label} value={value}>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <Checkbox
                        checked={
                          optimisticParams[filter.paramName]?.includes(rating.toString()) ?? false
                        }
                        disabled={filter.disabled}
                        key={rating}
                        label={<Rating rating={rating} showRating={false} />}
                        onCheckedChange={(checked) =>
                          startTransition(async () => {
                            const ratings = new Set(optimisticParams[filter.paramName]);

                            if (checked === true) ratings.add(rating.toString());
                            else ratings.delete(rating.toString());

                            const nextParams = {
                              ...optimisticParams,
                              [filter.paramName]: Array.from(ratings),
                              [startCursorParamName]: null,
                              [endCursorParamName]: null,
                            };

                            setOptimisticParams(nextParams);
                            await setParams(nextParams);
                          })
                        }
                      />
                    ))}
                  </div>
                </AccordionItem>
              );

            default:
              return null;
          }
        })}
      </Accordion>

      <Button
        onClick={() => {
          startTransition(async () => {
            const nextParams = {
              ...Object.fromEntries(Object.entries(optimisticParams).map(([key]) => [key, null])),
              [startCursorParamName]: optimisticParams[startCursorParamName],
              [endCursorParamName]: optimisticParams[endCursorParamName],
            };

            setOptimisticParams(nextParams);
            await setParams(nextParams);
          });
        }}
        size="small"
        variant="secondary"
      >
        {resetFiltersLabel}
      </Button>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-5">
      <AccordionSkeleton>
        <ToggleGroupSkeleton options={4} seed={2} />
      </AccordionSkeleton>
      <AccordionSkeleton>
        <ToggleGroupSkeleton options={3} seed={1} />
      </AccordionSkeleton>
      <AccordionSkeleton>
        <RangeSkeleton />
      </AccordionSkeleton>
      {/* Reset Filters Button */}
      <div className="h-10 w-[10ch] animate-pulse rounded-full bg-contrast-100" />
    </div>
  );
}

function AccordionSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="items-start py-3 font-mono text-sm uppercase last:flex @md:py-4">
        <div className="inline-flex h-[1lh] items-center">
          <div className="h-2 w-[10ch] flex-1 animate-pulse rounded-sm bg-contrast-100" />
        </div>
      </div>
      <div className="pb-5">{children}</div>
    </div>
  );
}

function ToggleGroupSkeleton({ options, seed = 0 }: { options: number; seed?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: options }, (_, i) => {
        const width = Math.floor(((i * 3 + 7 + seed) % 8) + 6);

        return (
          <div
            className="h-12 w-[var(--width)] animate-pulse rounded-full bg-contrast-100 px-4"
            key={i}
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            style={{ '--width': `${width}ch` } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

function RangeSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-12 w-[10ch] animate-pulse rounded-lg bg-contrast-100" />
      <div className="h-12 w-[10ch] animate-pulse rounded-lg bg-contrast-100" />
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-contrast-100" />
    </div>
  );
}
