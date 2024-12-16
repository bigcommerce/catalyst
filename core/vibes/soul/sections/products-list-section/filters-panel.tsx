/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import { clsx } from 'clsx';
import { ArrowRight } from 'lucide-react';
import { parseAsString, useQueryStates } from 'nuqs';
import { Suspense, use, useOptimistic } from 'react';

import { Checkbox } from '@/vibes/soul/form/checkbox';
import { RangeInput } from '@/vibes/soul/form/range-input';
import { ToggleGroup } from '@/vibes/soul/form/toggle-group';
import { Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
import { Accordion, Accordions } from '@/vibes/soul/primitives/accordions';
import { Button } from '@/vibes/soul/primitives/button';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Rating } from '@/vibes/soul/primitives/rating';

import { ProductListTransitionContext } from './context';
import { getFilterParsers } from './filter-parsers';

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

export type Filter = ToggleGroupFilter | RangeFilter | RatingFilter;

interface Props {
  className?: string;
  filters: Filter[] | Promise<Filter[]>;
  resetFiltersLabel?: string;
  paginationInfo?: Streamable<CursorPaginationInfo | null>;
}

function getParamCountLabel(params: Record<string, string | null | string[]>, key: string) {
  if (Array.isArray(params[key]) && params[key].length > 0) return `(${params[key].length})`;

  return '';
}

export function FiltersPanel({ className, filters, resetFiltersLabel }: Props) {
  return (
    <Suspense fallback={<FiltersSkeleton />}>
      <FiltersPanelInner
        className={className}
        filters={filters}
        resetFiltersLabel={resetFiltersLabel}
      />
    </Suspense>
  );
}

export function FiltersPanelInner({
  className,
  filters: streamableFilters,
  resetFiltersLabel = 'Reset filters',
  paginationInfo: streamablePaginationInfo,
}: Props) {
  const filters = useStreamable(streamableFilters);
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
  const [, startTransition] = use(ProductListTransitionContext);
  const [optimisticParams, setOptimisticParams] = useOptimistic(params);

  if (filters.length === 0) return null;

  return (
    <div className={clsx('space-y-5', className)}>
      <Accordions defaultValue={filters.map((_, i) => i.toString())} type="multiple">
        {filters.map((filter, index) => {
          switch (filter.type) {
            case 'toggle-group':
              return (
                <Accordion
                  key={index}
                  title={`${filter.label}${getParamCountLabel(optimisticParams, filter.paramName)}`}
                  value={index.toString()}
                >
                  <ToggleGroup
                    onValueChange={(value) => {
                      startTransition(async () => {
                        const nextParams = {
                          ...optimisticParams,
                          [startCursorParamName]: null,
                          [endCursorParamName]: null,
                          [filter.paramName]: value.length === 0 ? null : value,
                        };

                        setOptimisticParams(nextParams);
                        await setParams(nextParams);
                      });
                    }}
                    options={filter.options}
                    type="multiple"
                    value={optimisticParams[filter.paramName] ?? []}
                  />
                </Accordion>
              );

            case 'range':
              return (
                <Accordion key={index} title={filter.label} value={index.toString()}>
                  <div className="flex items-center gap-2">
                    <RangeInput
                      disabled={filter.disabled}
                      max={filter.max}
                      maxLabel={filter.maxLabel}
                      maxName={filter.minParamName}
                      maxPlaceholder={filter.maxPlaceholder}
                      maxPrepend={filter.maxPrepend}
                      maxValue={optimisticParams[filter.maxParamName] ?? null}
                      min={filter.min}
                      minLabel={filter.minLabel}
                      minName={filter.minParamName}
                      minPlaceholder={filter.minPlaceholder}
                      minPrepend={filter.minPrepend}
                      minValue={optimisticParams[filter.minParamName] ?? null}
                      onMaxValueChange={(value) => {
                        startTransition(async () => {
                          const nextParams = {
                            ...optimisticParams,
                            [filter.maxParamName]: value,
                            [startCursorParamName]: null,
                            [endCursorParamName]: null,
                          };

                          setOptimisticParams(nextParams);
                          await setParams(nextParams);
                        });
                      }}
                      onMinValueChange={(value) => {
                        startTransition(async () => {
                          const nextParams = {
                            ...optimisticParams,
                            [filter.minParamName]: value,
                            [startCursorParamName]: null,
                            [endCursorParamName]: null,
                          };

                          setOptimisticParams(nextParams);
                          await setParams(nextParams);
                        });
                      }}
                    />
                    <Button
                      className="shrink-0"
                      disabled={
                        filter.disabled === true ||
                        !(
                          optimisticParams[filter.minParamName] !==
                          optimisticParams[filter.maxParamName]
                        )
                      }
                      onClick={() => {
                        startTransition(async () => {
                          const nextParams = {
                            ...optimisticParams,
                            [filter.minParamName]: optimisticParams[filter.minParamName],
                            [filter.maxParamName]: optimisticParams[filter.maxParamName],
                            [startCursorParamName]: null,
                            [endCursorParamName]: null,
                          };

                          setOptimisticParams(nextParams);
                          await setParams(nextParams);
                        });
                      }}
                      shape="circle"
                      size="small"
                      variant="secondary"
                    >
                      <ArrowRight size={20} strokeWidth={1} />
                    </Button>
                  </div>
                </Accordion>
              );

            case 'rating':
              return (
                <Accordion key={index} title={filter.label} value={index.toString()}>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <Checkbox
                        checked={
                          optimisticParams[filter.paramName]?.includes(rating.toString()) ?? false
                        }
                        disabled={filter.disabled}
                        key={rating}
                        label={<Rating rating={rating} showRating={false} />}
                        onCheckedChange={(value) =>
                          startTransition(async () => {
                            const ratings = new Set(optimisticParams[filter.paramName]);

                            if (value === true) ratings.add(rating.toString());
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
                </Accordion>
              );

            default:
              return null;
          }
        })}
      </Accordions>

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

export function FiltersSkeleton() {
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
