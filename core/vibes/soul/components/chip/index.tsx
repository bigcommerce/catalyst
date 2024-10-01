import { clsx } from 'clsx';

interface Props {
  label: string;
  amount?: number;
  onClick: () => void;
  selected: boolean;
}

export const Chip = function Chip({ label, amount, onClick, selected }: Props) {
  return (
    <button
      className={clsx(
        'whitespace-nowrap rounded-full px-2 py-1 text-sm font-normal',
        'ring-primary focus-visible:outline-0 focus-visible:ring-2',
        'border border-transparent transition-colors',
        selected ? 'bg-foreground text-background' : 'bg-contrast-100 hover:border-contrast-300',
      )}
      onClick={onClick}
    >
      {label} <span className="text-contrast-300">{amount}</span>
    </button>
  );
};
