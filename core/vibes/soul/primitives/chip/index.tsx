import { X } from 'lucide-react';
import { MouseEvent, ReactNode } from 'react';

export interface ChipProps {
  name?: string;
  value?: string;
  children?: ReactNode;
  removeLabel?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --chip-focus: hsl(var(--foreground));
 *   --chip-font-family: var(--font-family-body);
 *   --chip-background: hsl(var(--contrast-100));
 *   --chip-background-hover: hsl(var(--contrast-200));
 *   --chip-text: hsl(var(--foreground));
 * }
 * ```
 */
export const Chip = function Chip({
  name,
  value,
  children,
  removeLabel = 'Remove',
  onClick,
}: ChipProps) {
  return (
    <span className="flex h-9 items-center gap-1.5 rounded-lg bg-[var(--chip-background,hsl(var(--contrast-100)))] py-2 pe-2 ps-3 font-[family-name:var(--chip-font-family,var(--font-family-body))] text-sm font-semibold leading-5 text-[var(--chip-text,hsl(var(--foreground)))]">
      {children}
      <button
        className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-[var(--chip-background-hover,hsl(var(--contrast-200)))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--button-focus,hsl(var(--foreground)))]"
        name={name}
        onClick={onClick}
        title={removeLabel}
        value={value}
      >
        <X size={12} />
      </button>
    </span>
  );
};
