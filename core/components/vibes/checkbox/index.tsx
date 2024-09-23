import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface Props {
  checked: boolean;
  setChecked?: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const Checkbox = function Checkbox({
  checked = false,
  setChecked,
  label,
  className = '',
}: Props) {
  return (
    <div className={clsx('flex gap-2', className)}>
      <RadixCheckbox.Root
        checked={checked}
        className={clsx(
          'flex h-6 w-6 items-center justify-center rounded-md border transition-colors duration-150',
          'focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary',
          checked ? 'border-foreground bg-foreground' : 'border-contrast-300 bg-background',
        )}
        defaultChecked
        id="checkbox"
        onCheckedChange={setChecked && setChecked}
      >
        <RadixCheckbox.Indicator>
          <Check className="h-4 w-4" color="white" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>

      {label != null && label !== '' && (
        <label className="cursor-pointer select-none text-foreground" htmlFor="checkbox">
          {label}
        </label>
      )}
    </div>
  );
};
