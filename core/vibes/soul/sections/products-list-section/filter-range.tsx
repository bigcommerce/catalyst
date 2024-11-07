'use client';

import { ArrowRight } from 'lucide-react';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { RangeInput } from '@/vibes/soul/form/range-input';

type Props = {
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

export function FilterRange({
  min,
  max,
  minParamName,
  maxParamName,
  minLabel,
  maxLabel,
  minPrepend,
  maxPrepend,
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
}: Props) {
  const [params, setParams] = useQueryStates(
    {
      [minParamName]: parseAsInteger,
      [maxParamName]: parseAsInteger,
    },
    { shallow: false },
  );
  const [minState, setMinState] = useState<number | null>(params[minParamName] ?? null);
  const [maxState, setMaxState] = useState<number | null>(params[maxParamName] ?? null);
  const isDirty =
    (minState !== params[minParamName] && !(params[minParamName] === null && minState === min)) ||
    (maxState !== params[maxParamName] && !(params[maxParamName] === null && maxState === max));

  useEffect(() => {
    setMinState(params[minParamName] ?? null);
    setMaxState(params[maxParamName] ?? null);
  }, [params, min, max, minParamName, maxParamName]);

  return (
    <div className="flex items-center gap-2">
      <RangeInput
        max={max}
        maxLabel={maxLabel}
        maxName={minParamName}
        maxPlaceholder={maxPlaceholder}
        maxPrepend={maxPrepend}
        maxValue={maxState}
        min={min}
        minLabel={minLabel}
        minName={minParamName}
        minPlaceholder={minPlaceholder}
        minPrepend={minPrepend}
        minValue={minState}
        onMaxValueChange={(value) => setMaxState(Number.isNaN(value) ? null : value)}
        onMinValueChange={(value) => setMinState(Number.isNaN(value) ? null : value)}
      />
      <Button
        className="shrink-0"
        disabled={!isDirty}
        onClick={() => setParams({ [minParamName]: minState, [maxParamName]: maxState })}
        size="icon"
        variant="secondary"
      >
        <ArrowRight size={20} strokeWidth={1} />
      </Button>
    </div>
  );
}
