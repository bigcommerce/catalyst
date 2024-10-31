'use client'

import { Suspense, use } from 'react'

import { parseAsString, useQueryState } from 'nuqs'

import { Select } from '@/vibes/soul/form/select'

export interface Option {
  label: string
  value: string
}

interface Props {
  options: Option[] | Promise<Option[]>
  label?: string
  paramName?: string
  defaultValue?: string
}

export function Sorting({ label = 'Sort', options, paramName }: Props) {
  return (
    <Suspense fallback={<SortingSkeleton placeholder={label} />}>
      <SortingInner options={options} label={label} paramName={paramName} />
    </Suspense>
  )
}

function SortingInner({ label = 'Sort', options, paramName = 'sort', defaultValue = '' }: Props) {
  const [param, setParam] = useQueryState(paramName, parseAsString.withDefault(defaultValue))
  const resolved = options instanceof Promise ? use(options) : options

  return (
    <Select
      placeholder={label}
      variant="round"
      options={resolved}
      value={param}
      onValueChange={value => void setParam(value)}
    />
  )
}

function SortingSkeleton({ placeholder }: { placeholder: string }) {
  return <Select placeholder={placeholder} disabled options={[]} variant="round" />
}
