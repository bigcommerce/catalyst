import { PropsWithChildren } from 'react';

import { ComponentClasses } from './types';

interface BadgeProps extends PropsWithChildren<React.HTMLAttributes<HTMLDivElement>> {
  label: string;
}

type Badge = React.FC<BadgeProps> & ComponentClasses<'default'>;

export const Badge: Badge = ({ children, label, ...props }) => {
  return (
    <div aria-atomic="true" aria-label={label} aria-live="polite" role="status" {...props}>
      {children}
    </div>
  );
};

Badge.default = {
  className:
    'inline-flex justify-center items-center rounded-[28px] py-0 px-1 h-7 min-w-[28px] border-2 border-solid border-white text-xs font-bold leading-none text-white bg-[#053FB0]',
};
