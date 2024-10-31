import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'

import { ToggleGroup } from '@/vibes/soul/form/toggle-group'

interface Props {
  options: { label: string; value: string }[]
  paramName: string
}

export function FilterToggleGroup({ paramName, options }: Props) {
  const [param, setParam] = useQueryState(
    paramName,
    parseAsArrayOf(parseAsString).withOptions({ shallow: false })
  )

  return (
    <ToggleGroup
      type="multiple"
      options={options}
      value={param ?? []}
      onValueChange={value => {
        setParam(value).catch(() => console.error(`Failed to update ${paramName} param`))
      }}
    />
  )
}
