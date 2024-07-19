import { ComponentPropsWithoutRef } from 'react';

import { cn } from '~/lib/utils';

interface Props extends ComponentPropsWithoutRef<'span'> {
  label: string;
}

const Badge = ({ children, className, label, ...props }: Props) => {
  return (
    <span
      className={cn(
        'absolute end-0 top-0 min-w-[24px] rounded-[28px] border-2 border-white bg-primary px-1 py-px text-center text-xs font-bold font-normal leading-normal text-white',
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
};

export { Badge };
