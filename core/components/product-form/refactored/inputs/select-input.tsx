export interface Props extends React.InputHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: Array<{
    label: string;
    value: string;
  }>;
}

export function SelectInput({ name, label, error, options, ...props }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-md" htmlFor={name}>
          {label}
        </label>
        <select className="rounded-md border border-gray-300" id={name} name={name} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="text-sm text-red-500">{error}</div>
    </div>
  );
}
