import { clsx } from 'clsx';

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loadingAriaLabel?: string;
}

export const Spinner = function Spinner({ size = 'sm', loadingAriaLabel }: Props) {
  return (
    <span
      aria-label={loadingAriaLabel ?? 'Loading...'}
      className={clsx(
        'box-border inline-block animate-spin rounded-full border-contrast-100 border-b-primary-shadow',
        {
          xs: 'h-5 w-5 border-2',
          sm: 'h-6 w-6 border-2',
          md: 'h-10 w-10 border-[3px]',
          lg: 'h-14 w-14 border-4',
        }[size],
      )}
      role="status"
    />
  );
};
