import * as SwitchPrimitive from '@radix-ui/react-switch';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { useId } from 'react';

import * as Skeleton from '@/vibes/soul/primitives/skeleton';

interface Props {
  name?: string;
  required?: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'large' | 'medium' | 'small';
  labelPosition?: 'left' | 'right' | 'both';
  label?: string | { on: string; off: string };
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}

export const Switch = ({
  name,
  variant = 'primary',
  size = 'medium',
  labelPosition = 'right',
  label,
  disabled,
  loading,
  checked,
  onCheckedChange,
}: Props) => {
  const id = useId();
  const hasLabel = label != null && label !== '';

  return (
    <div className="group/switch flex items-center gap-2">
      {(labelPosition === 'left' || labelPosition === 'both') && hasLabel && (
        <SwitchLabel
          id={id}
          label={label}
          size={size}
          state={labelPosition === 'both' ? 'off' : undefined}
        />
      )}
      <SwitchPrimitive.Root
        aria-busy={loading}
        checked={checked}
        className={clsx(
          'w-12 rounded-full border border-contrast-200 p-[3px] transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 data-[disabled]:cursor-not-allowed [&:not([data-loading])]:data-[disabled]:bg-contrast-100',
        )}
        data-loading={loading ? '' : undefined}
        disabled={disabled || loading}
        id={id}
        name={name}
        onCheckedChange={onCheckedChange}
      >
        <SwitchPrimitive.Thumb
          className={clsx(
            'relative block h-5 w-5 overflow-hidden rounded-full transition-transform duration-100 data-[state=checked]:translate-x-full data-[disabled]:bg-contrast-200 data-[state=unchecked]:bg-contrast-200',
            {
              primary: 'bg-[var(--toggle-primary-background,hsl(var(--primary)))]',
              secondary: 'bg-[var(--toggle-secondary-background,hsl(var(--foreground)))]',
              tertiary:
                'border border-[var(--toggle-tertiary-border,hsl(var(--contrast-200)))] bg-[var(--toggle-tertiary-background,hsl(var(--background)))]',
            }[variant],
          )}
        >
          <span
            className={clsx(
              'absolute inset-0 grid place-content-center transition-all duration-300 ease-in-out',
              loading ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
            )}
          >
            <Loader2
              className={clsx('animate-spin', variant === 'tertiary' && 'text-foreground')}
              size={16}
            />
          </span>
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
      {(labelPosition === 'right' || labelPosition === 'both') && hasLabel && (
        <SwitchLabel
          id={id}
          label={label}
          loading={loading}
          size={size}
          state={labelPosition === 'both' ? 'on' : undefined}
        />
      )}
    </div>
  );
};

interface LabelProps {
  id: string;
  label: string | { on: string; off: string };
  size: 'large' | 'medium' | 'small';
  state?: 'off' | 'on';
  loading?: boolean;
}

function SwitchLabel({ id, label, size = 'medium', state, loading }: LabelProps) {
  const baseClass =
    '[&:not([data-loading])]:group-has-[[data-disabled]]/switch:text-contrast-400 font-semibold select-none';
  const sizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  }[size];

  if (typeof label === 'string') {
    return (
      <label
        className={clsx(baseClass, sizeClass)}
        data-loading={loading ? '' : undefined}
        htmlFor={id}
      >
        {label}
      </label>
    );
  }

  if (state) {
    return (
      <label
        className={clsx(baseClass, sizeClass)}
        data-loading={loading ? '' : undefined}
        htmlFor={id}
      >
        {label[state]}
      </label>
    );
  }

  return (
    <div className="leading-[0]">
      <label
        className={clsx(
          'mb-[-2px] group-has-[[data-state=unchecked]]/switch:invisible group-has-[[data-state=checked]]/switch:block',
          baseClass,
          sizeClass,
        )}
        data-loading={loading ? '' : undefined}
        htmlFor={id}
      >
        {label.on}
      </label>
      <label
        className={clsx(
          'group-has-[[data-state=checked]]/switch:invisible group-has-[[data-state=unchecked]]/switch:block',
          baseClass,
          sizeClass,
        )}
        data-loading={loading ? '' : undefined}
        htmlFor={id}
      >
        {label.off}
      </label>
    </div>
  );
}

export function SwitchSkeleton({
  size = 'medium',
  labelPosition = 'right',
  characterCount = 6,
}: Pick<Props, 'size' | 'labelPosition'> & { characterCount?: number }) {
  return (
    <div className="flex items-center gap-2">
      {(labelPosition === 'left' || labelPosition === 'both') && (
        <Skeleton.Text
          characterCount={characterCount}
          className={clsx(
            'rounded',
            {
              small: 'text-sm',
              medium: 'text-base',
              large: 'text-lg',
            }[size],
          )}
        />
      )}
      <Skeleton.Box className="h-6 w-12 rounded-full p-[3px]" />
      {(labelPosition === 'right' || labelPosition === 'both') && (
        <Skeleton.Text
          characterCount={characterCount}
          className={clsx(
            'rounded',
            {
              small: 'text-sm',
              medium: 'text-base',
              large: 'text-lg',
            }[size],
          )}
        />
      )}
    </div>
  );
}
