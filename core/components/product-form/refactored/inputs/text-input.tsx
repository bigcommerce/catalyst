export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextInput({ name, label, error, ...props }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-md" htmlFor={name}>
          {label}
        </label>
        <input {...props} className="border text-black" name={name} type="text" />
      </div>
      <div className="text-sm text-red-500">{error}</div>
    </div>
  );
}
