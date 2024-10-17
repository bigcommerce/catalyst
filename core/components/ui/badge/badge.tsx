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
        'cart',
        className,
      )}
      {...props}
    >
     ({children}) 
    </span>
  );
};

export { Badge };
