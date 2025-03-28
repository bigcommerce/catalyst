import { X } from 'lucide-react';

interface Props {
  name?: string;
  value?: string;
  children?: React.ReactNode;
  removeLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Chip = function Chip({
  name,
  value,
  children,
  removeLabel = 'Remove',
  onClick,
}: Props) {
  return (
    <span className="flex h-9 items-center gap-1.5 rounded-lg bg-contrast-100 py-2 pe-2 ps-3 text-sm font-semibold leading-5 text-foreground">
      {children}
      <button
        className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-contrast-200 focus:outline-hidden focus:ring-1 focus:ring-foreground"
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
