export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function CheckboxInput({ name, label, error, checked, ...props }: Props) {
  return (
    <div className="space-y-2">
      <input {...props} checked={checked} id={name} name={name} type="checkbox" />
      <label htmlFor={name}>{label}</label>
      <div className="text-sm text-red-500">{error}</div>
    </div>
  );
}
