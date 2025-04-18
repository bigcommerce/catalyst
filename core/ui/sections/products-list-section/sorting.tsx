'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useOptimistic, useTransition } from 'react';

import { Select } from '@/ui/form/select';
import { Streamable, useStreamable } from '@/ui/lib/streamable';

export interface Option {
  label: string;
  value: string;
}

export function Sorting({
  label: streamableLabel,
  options: streamableOptions,
  paramName = 'sort',
  defaultValue = '',
  placeholder: streamablePlaceholder,
}: {
  label?: Streamable<string | null>;
  options: Streamable<Option[]>;
  paramName?: string;
  defaultValue?: string;
  placeholder?: Streamable<string | null>;
}) {
  const [param, setParam] = useQueryState(
    paramName,
    parseAsString.withDefault(defaultValue).withOptions({ shallow: false, history: 'push' }),
  );
  const [optimisticParam, setOptimisticParam] = useOptimistic(param);
  const [isPending, startTransition] = useTransition();
  const options = useStreamable(streamableOptions);
  const label = useStreamable(streamableLabel) ?? 'Sort';
  const placeholder = useStreamable(streamablePlaceholder) ?? 'Sort by';

  return (
    <Select
      hideLabel
      label={label}
      name={paramName}
      onValueChange={(value) => {
        startTransition(async () => {
          setOptimisticParam(value);
          await setParam(value);
        });
      }}
      options={options}
      pending={isPending}
      placeholder={placeholder}
      value={optimisticParam}
      variant="round"
    />
  );
}

export function SortingSkeleton() {
  return <div className="bg-contrast-100 h-[50px] w-[12ch] animate-pulse rounded-full" />;
}
