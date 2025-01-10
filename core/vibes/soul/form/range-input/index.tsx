'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';

interface Props {
  applyLabel?: string;
  disabled?: boolean;
  max?: number;
  maxLabel?: string;
  maxName?: string;
  maxPlaceholder?: string;
  maxPrepend?: React.ReactNode;
  maxStep?: number;
  min?: number;
  minLabel?: string;
  minName?: string;
  minPlaceholder?: string;
  minPrepend?: React.ReactNode;
  minStep?: number;
  onChange?: (value: { min: number | null; max: number | null }) => void;
  value?: { min: number | null; max: number | null };
}

const clamp = (value: number, min: number | null, max?: number | null) =>
  Math.min(Math.max(value, min ?? -Infinity), max ?? Infinity);

export function RangeInput({
  applyLabel = 'Apply',
  disabled = false,
  max,
  maxLabel,
  maxName = 'max',
  maxPlaceholder = 'Max',
  maxPrepend,
  maxStep,
  min,
  minLabel,
  minName = 'min',
  minPlaceholder = 'Min',
  minPrepend,
  minStep,
  onChange,
  value,
}: Props) {
  const [state, setState] = useState({
    min: value?.min?.toString() ?? '',
    max: value?.max?.toString() ?? '',
  });

  useEffect(() => {
    setState({ min: value?.min?.toString() ?? '', max: value?.max?.toString() ?? '' });
  }, [value]);

  const parsedMinState = parseInt(state.min, 10);
  const parsedMaxState = parseInt(state.max, 10);
  const minStateAsNumber = Number.isNaN(parsedMinState) ? null : parsedMinState;
  const maxStateAsNumber = Number.isNaN(parsedMaxState) ? null : parsedMaxState;

  return (
    <div className="flex w-full items-center gap-2">
      <Input
        className="flex-1"
        disabled={disabled}
        label={minLabel}
        max={maxStateAsNumber ?? max}
        min={min}
        name={minName}
        onBlur={(e) => {
          const clamped = clamp(
            e.currentTarget.valueAsNumber,
            min ?? null,
            e.currentTarget.max === '' ? null : parseInt(e.currentTarget.max, 10),
          );
          const nextValue = Number.isNaN(clamped) ? null : clamped;

          setState((prev) => ({ ...prev, min: nextValue?.toString() ?? '' }));
        }}
        onChange={(e) => {
          const nextValue = e.currentTarget.value;

          setState((prev) => ({ ...prev, min: nextValue }));
        }}
        placeholder={minPlaceholder}
        prepend={minPrepend}
        step={minStep}
        type="number"
        value={state.min}
      />
      <Input
        className="flex-1"
        disabled={disabled}
        label={maxLabel}
        max={max}
        min={minStateAsNumber ?? min}
        name={maxName}
        onBlur={(e) => {
          const clamped = clamp(
            e.currentTarget.valueAsNumber,
            e.currentTarget.min === '' ? null : parseInt(e.currentTarget.min, 10),
            max,
          );
          const nextValue = Number.isNaN(clamped) ? null : clamped;

          setState((prev) => ({ ...prev, max: nextValue?.toString() ?? '' }));
        }}
        onChange={(e) => {
          const nextValue = e.currentTarget.value;

          setState((prev) => ({ ...prev, max: nextValue }));
        }}
        placeholder={maxPlaceholder}
        prepend={maxPrepend}
        step={maxStep}
        type="number"
        value={state.max}
      />
      <Button
        className="shrink-0"
        disabled={disabled || (state.min === state.max && state.min !== '' && state.max !== '')}
        onClick={() =>
          onChange?.({
            min: state.min === '' ? null : Number(state.min),
            max: state.max === '' ? null : Number(state.max),
          })
        }
        shape="circle"
        size="small"
        variant="secondary"
      >
        <span className="sr-only">{applyLabel}</span>
        <ArrowRight size={20} strokeWidth={1} />
      </Button>
    </div>
  );
}
