'use client';

import { Input } from '@/vibes/soul/form/input';

interface Props {
  minName?: string;
  maxName?: string;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  minPrepend?: React.ReactNode;
  maxPrepend?: React.ReactNode;
  minValue?: number | null;
  maxValue?: number | null;
  onMinValueChange?: (value: number) => void;
  onMaxValueChange?: (value: number) => void;
  minStep?: number;
  maxStep?: number;
  disabled?: boolean;
}

const clamp = (value: number, min = -Infinity, max = Infinity) =>
  Math.min(Math.max(value, min), max);

export function RangeInput({
  minName = 'min',
  maxName = 'max',
  min,
  max,
  minLabel,
  maxLabel,
  minPrepend,
  maxPrepend,
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
  minValue,
  maxValue,
  onMinValueChange,
  onMaxValueChange,
  minStep,
  maxStep,
  disabled,
}: Props) {
  return (
    <div className="flex w-full items-center gap-2">
      <Input
        className="flex-1"
        disabled={disabled}
        label={minLabel}
        max={maxValue ?? max}
        min={min}
        name={minName}
        onBlur={(e) => {
          const clamped = clamp(e.currentTarget.valueAsNumber, min, maxValue ?? max);

          if (Number.isNaN(clamped)) e.currentTarget.value = clamped.toString();

          onMinValueChange?.(clamped);
        }}
        onChange={(e) => onMinValueChange?.(e.currentTarget.valueAsNumber)}
        placeholder={minPlaceholder}
        prepend={minPrepend}
        step={minStep}
        type="number"
        value={minValue ?? ''}
      />
      <Input
        className="flex-1"
        disabled={disabled}
        label={maxLabel}
        max={max}
        min={minValue ?? min}
        name={maxName}
        onBlur={(e) => {
          const clamped = clamp(e.currentTarget.valueAsNumber, minValue ?? min, max);

          if (!Number.isNaN(clamped)) e.currentTarget.value = clamped.toString();

          onMaxValueChange?.(clamped);
        }}
        onChange={(e) => onMaxValueChange?.(e.currentTarget.valueAsNumber)}
        placeholder={maxPlaceholder}
        prepend={maxPrepend}
        step={maxStep}
        type="number"
        value={maxValue ?? ''}
      />
    </div>
  );
}
