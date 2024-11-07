'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { Suspense, use } from 'react';

import { Select } from '@/vibes/soul/form/select';

export type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[] | Promise<Option[]>;
  label?: string;
  paramName?: string;
  defaultValue?: string;
};

export function Sorting({ label = 'Sort', options, paramName }: Props) {
  return (
    <Suspense fallback={<SortingSkeleton placeholder={label} />}>
      <SortingInner label={label} options={options} paramName={paramName} />
    </Suspense>
  );
}

function SortingInner({ label = 'Sort', options, paramName = 'sort', defaultValue = '' }: Props) {
  const [param, setParam] = useQueryState(paramName, parseAsString.withDefault(defaultValue));
  const resolved = options instanceof Promise ? use(options) : options;

  return (
    <Select
      name={paramName}
      onValueChange={(value) => setParam(value)}
      options={resolved}
      placeholder={label}
      value={param}
      variant="round"
    />
  );
}

function SortingSkeleton({ placeholder }: { placeholder: string }) {
  return <Select disabled name="skeleton" options={[]} placeholder={placeholder} variant="round" />;
}
