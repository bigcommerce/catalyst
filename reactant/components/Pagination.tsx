import { PropsWithChildren } from 'react';

interface ClassName {
  className: string;
}

type ComponentProps<Props, VariantKey extends string> = React.FC<Props> &
  Record<VariantKey, ClassName>;

type PaginationProps = React.HTMLAttributes<HTMLDivElement> & PropsWithChildren;
type Pagination = ComponentProps<PaginationProps, 'default'> & {
  NextPage?: { className: string };
  PrevPage?: { className: string };
};

export const Pagination: Pagination = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

Pagination.default = {
  className: 'flex flex-row justify-center items-center gap-2 mt-11 mb-14',
};
Pagination.NextPage = {
  className: 'fill-none stroke-black hover:stroke-[#053FB0] cursor-pointer m-3',
};
Pagination.PrevPage = {
  className: 'fill-none stroke-black hover:stroke-[#053FB0] cursor-pointer m-3',
};
