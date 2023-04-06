import { PropsWithChildren } from 'react';

import { ComponentClasses } from './types';

type LinkProps = PropsWithChildren<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
type Link = React.FC<LinkProps> &
  ComponentClasses<'text' | 'iconOnly'> & {
    Icon: ComponentClasses<'default'>;
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
  default: {
    className:
      'inline-block h-6 w-6 fill-black stroke-black hover:fill-[#053FB0] hover:stroke-[#053FB0]',
  },
};
