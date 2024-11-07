import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import { ToggleGroup } from '@/vibes/soul/form/toggle-group';

type Props = {
  options: Array<{ label: string; value: string }>;
  paramName: string;
};

export function FilterToggleGroup({ paramName, options }: Props) {
  const [param, setParam] = useQueryState(
    paramName,
    parseAsArrayOf(parseAsString).withOptions({ shallow: false }),
  );

  return (
    <ToggleGroup
      onValueChange={(value) => {
        setParam(value).catch(() => console.error(`Failed to update ${paramName} param`));
      }}
      options={options}
      type="multiple"
      value={param ?? []}
    />
  );
}
