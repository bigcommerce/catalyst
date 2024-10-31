import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { clsx } from 'clsx'
import { Check } from 'lucide-react'

interface Props {
  id?: string
  checked: boolean
  // TODO: refactor props here
  setChecked?: (checked: boolean) => void
  label?: React.ReactNode
  error?: string
  className?: string
}

export function Checkbox({ id, checked = false, setChecked, label, error, className }: Props) {
  return (
    <div>
      <div className={clsx('flex items-center gap-2', className)}>
        <RadixCheckbox.Root
          id={id}
          className={clsx(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors duration-150',
            'focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary',
            checked ? 'border-foreground bg-foreground' : 'border-contrast-300 bg-background',
            error != null && error !== '' ? 'border-error' : 'border-contrast-300'
          )}
          defaultChecked
          checked={checked}
          onCheckedChange={setChecked}
        >
          <RadixCheckbox.Indicator>
            <Check color="white" className="h-4 w-4" />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>

        {label != null && label !== '' && (
          <label className="cursor-pointer select-none text-foreground" htmlFor={id}>
            {label}
          </label>
        )}
      </div>
      {error != null && error !== '' && <span className="text-xs text-error">{error}</span>}
    </div>
  )
}
