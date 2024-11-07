'use client';

import clsx from 'clsx';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { Suspense, use } from 'react';

import { Accordion, Accordions } from '@/vibes/soul/primitives/accordions';
import { Button } from '@/vibes/soul/primitives/button';

import { FilterRange } from './filter-range';
import { FilterRating } from './filter-rating';
import { FilterToggleGroup } from './filter-toggle-group';

export type ToggleGroupFilter = {
  type: 'toggle-group';
  paramName: string;
  label: string;
  options: Array<{ label: string; value: string }>;
};

export type RatingFilter = {
  type: 'rating';
  paramName: string;
  label: string;
};

export type RangeFilter = {
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
};

export type Filter = ToggleGroupFilter | RangeFilter | RatingFilter;

type Props = {
  className?: string;
  filters: Filter[] | Promise<Filter[]>;
  resetFiltersLabel?: string;
};

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
  filters,
  resetFiltersLabel = 'Reset filters',
}: Props) {
  const resolved = filters instanceof Promise ? use(filters) : filters;
  const [params, setParams] = useQueryStates(
    resolved.reduce((acc, filter) => {
      switch (filter.type) {
        case 'range':
          return {
            ...acc,
            [filter.minParamName]: parseAsInteger,
            [filter.maxParamName]: parseAsInteger,
          };

        default:
          return { ...acc, [filter.paramName]: parseAsArrayOf(parseAsString) };
      }
    }, {}),
    { shallow: false },
  );

  if (resolved.length === 0) return null;

  return (
    <div className={clsx('space-y-5', className)}>
      <Accordions defaultValue={resolved.map((_, i) => i.toString())} type="multiple">
        {resolved.map((filter, index) => {
          switch (filter.type) {
            case 'toggle-group':
              return (
                <Accordion
                  key={index}
                  title={`${filter.label}${getParamCountLabel(params, filter.paramName)}`}
                  value={index.toString()}
                >
                  <FilterToggleGroup options={filter.options} paramName={filter.paramName} />
                </Accordion>
              );

            case 'range':
              return (
                <Accordion key={index} title={filter.label} value={index.toString()}>
                  <FilterRange
                    max={filter.max}
                    maxLabel={filter.maxLabel}
                    maxParamName={filter.maxParamName}
                    maxPlaceholder={filter.maxPlaceholder}
                    maxPrepend={filter.maxPrepend}
                    min={filter.min}
                    minLabel={filter.minLabel}
                    minParamName={filter.minParamName}
                    minPlaceholder={filter.minPlaceholder}
                    minPrepend={filter.minPrepend}
                  />
                </Accordion>
              );

            case 'rating':
              return (
                <Accordion key={index} title={filter.label} value={index.toString()}>
                  <FilterRating paramName={filter.paramName} />
                </Accordion>
              );

            default:
              return null;
          }
        })}
      </Accordions>

      <Button
        onClick={() => {
          void setParams(null);
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
  return <div>Skeleton!</div>;
}
