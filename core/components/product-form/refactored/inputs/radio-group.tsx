export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  options: Array<{
    label: string;
    value: string;
  }>;
  required?: boolean;
  error?: string;
}

export function RadioGroup({ label, name, value, options, error, ...props }: Props) {
  return (
    <div className="space-y-2">
      <fieldset>
        <legend>{label}</legend>

        {options.map((option) => (
          <div key={option.value}>
            <input
              {...props}
              checked={value === option.value}
              id={option.value}
              name={name}
              type="radio"
              value={option.value}
            />
            <label htmlFor={option.value}>{option.label}</label>
          </div>
        ))}
      </fieldset>
      <div className="text-sm text-red-500">{error}</div>
    </div>
  );
}
