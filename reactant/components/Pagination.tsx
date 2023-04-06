import { PropsWithChildren } from 'react';

import { ComponentClasses } from './types';

type PaginationProps = PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>;
type Pagination = React.FC<PaginationProps> &
  ComponentClasses<'default'> & {
    NextPage: ComponentClasses<'default'>;
    PrevPage: ComponentClasses<'default'>;
  };

export const Pagination: Pagination = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

Pagination.default = {
  className: 'flex flex-row justify-center items-center gap-2 mt-11 mb-14',
};

Pagination.NextPage = {
  default: {
    className: 'fill-none stroke-black hover:stroke-[#053FB0] cursor-pointer m-3',
  },
};

Pagination.PrevPage = {
  default: {
    className: 'fill-none stroke-black hover:stroke-[#053FB0] cursor-pointer m-3',
  },
};
