'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { Suspense, use, useOptimistic } from 'react';

import { Select } from '@/vibes/soul/form/select';
import { Streamable, useStreamable } from '@/vibes/soul/lib/streamable';

import { ProductListTransitionContext } from './context';

export interface Option {
  label: string;
  value: string;
}

export function Sorting({
  label,
  options,
  paramName = 'sort',
  defaultValue = '',
}: {
  label?: Streamable<string | null>;
  options: Streamable<Option[]>;
  paramName?: string;
  defaultValue?: string;
}) {
  return (
    <Suspense fallback={<SortingSkeleton />}>
      <SortingInner
        defaultValue={defaultValue}
        label={label}
        options={options}
        paramName={paramName}
      />
    </Suspense>
  );
}

function SortingInner({
  paramName,
  defaultValue,
  options: streamableOptions,
  label: streamableLabel,
}: {
  paramName: string;
  defaultValue: string;
  options: Streamable<Option[]>;
  label?: Streamable<string | null>;
}) {
  const [param, setParam] = useQueryState(
    paramName,
    parseAsString.withDefault(defaultValue).withOptions({ shallow: false, history: 'push' }),
  );
  const [optimisticParam, setOptimisticParam] = useOptimistic(param);
  const [, startTransition] = use(ProductListTransitionContext);
  const options = useStreamable(streamableOptions);
  const label = useStreamable(streamableLabel) ?? 'Sort';

  return (
    <Select
      name={paramName}
      onValueChange={(value) => {
        startTransition(async () => {
          setOptimisticParam(value);
          await setParam(value);
        });
      }}
      options={options}
      placeholder={label}
      value={optimisticParam}
      variant="round"
    />
  );
}

function SortingSkeleton() {
  return <div className="h-[50px] w-[12ch] animate-pulse rounded-full bg-contrast-100" />;
}
