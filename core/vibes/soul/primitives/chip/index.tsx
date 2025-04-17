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
    <span className="bg-contrast-100 text-foreground flex h-9 items-center gap-1.5 rounded-lg py-2 ps-3 pe-2 text-sm leading-5 font-semibold">
      {children}
      <button
        className="hover:bg-contrast-200 focus:ring-foreground flex h-5 w-5 items-center justify-center rounded-full focus:ring-1 focus:outline-hidden"
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
