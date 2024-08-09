import { ReactNode } from 'react';

import { cn } from '~/lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
}

const Badge = ({ children, className, ...props }: Props) => {
  return (
    <span
      className={cn(
        'absolute end-0 top-0 min-w-[24px] rounded-[28px] border-2 border-white bg-primary px-1 py-px text-center text-xs font-semibold leading-normal text-white',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };
