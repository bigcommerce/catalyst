'use client'

import { Input } from '@/vibes/soul/form/input'

interface Props {
  minName?: string
  maxName?: string
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
  minPlaceholder?: string
  maxPlaceholder?: string
  minPrepend?: React.ReactNode
  maxPrepend?: React.ReactNode
  minValue?: number | null
  maxValue?: number | null
  onMinValueChange?: (value: number) => void
  onMaxValueChange?: (value: number) => void
  minStep?: number
  maxStep?: number
}

const clamp = (value: number, min = -Infinity, max = Infinity) =>
  Math.min(Math.max(value, min), max)

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
}: Props) {
  return (
    <div className="flex w-full items-center gap-2">
      <Input
        type="number"
        name={minName}
        label={minLabel}
        prepend={minPrepend}
        value={minValue ?? ''}
        min={min}
        max={maxValue ?? max}
        step={minStep}
        onChange={e => onMinValueChange?.(e.currentTarget.valueAsNumber)}
        placeholder={minPlaceholder}
        onBlur={e => {
          const clamped = clamp(e.currentTarget.valueAsNumber, min, maxValue ?? max)

          if (Number.isNaN(clamped)) e.currentTarget.value = clamped.toString()

          onMinValueChange?.(clamped)
        }}
        className="flex-1"
      />
      <Input
        type="number"
        name={maxName}
        label={maxLabel}
        prepend={maxPrepend}
        min={minValue ?? min}
        max={max}
        step={maxStep}
        value={maxValue ?? ''}
        onChange={e => onMaxValueChange?.(e.currentTarget.valueAsNumber)}
        placeholder={maxPlaceholder}
        onBlur={e => {
          const clamped = clamp(e.currentTarget.valueAsNumber, minValue ?? min, max)

          if (!Number.isNaN(clamped)) e.currentTarget.value = clamped.toString()

          onMaxValueChange?.(clamped)
        }}
        className="flex-1"
      />
    </div>
  )
}
