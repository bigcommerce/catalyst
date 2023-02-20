import { PropsWithChildren } from 'react';

interface ClassName {
  className: string;
}

type ComponentClasses<Union extends string> = Record<Union, ClassName>;
type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & PropsWithChildren;
type Link = React.FC<LinkProps> &
  ComponentClasses<'text' | 'iconOnly'> & {
    Icon: { className?: string };
  };

export const Link: Link = ({ children, href, ...props }) => {
  return (
    <a href={href ?? '/'} {...props}>
      {children}
    </a>
  );
};

Link.text = {
  className: 'flex flex-row items-center text-base font-normal hover:text-[#053FB0]',
};
Link.iconOnly = {
  className: 'flex flex-row items-center text-base font-normal hover:text-[#053FB0]',
};
Link.Icon = {
  className:
    'inline-block h-6 w-6 fill-black stroke-black hover:fill-[#053FB0] hover:stroke-[#053FB0]',
};
