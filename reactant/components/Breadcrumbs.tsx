import { PropsWithChildren } from 'react';

import { Link } from './Link';

interface ClassName {
  className: string;
}

type BreadcrumbsClasses<Props extends string> = Record<Props, ClassName>;
type BreadcrumbsProps = React.HTMLAttributes<HTMLUListElement>;
type Breadcrumbs = React.FC<BreadcrumbsProps> &
  BreadcrumbsClasses<'default'> & {
    Item: React.FC<ItemProps> & ItemClasses<'default'>;
    Path: React.FC<PathProps> & PathClasses<'default'> & PathClasses<'lastItem'>;
    Divider: React.FC<DividerProps> & DividerClasses<'default'>;
  };

export const Breadcrumbs: Breadcrumbs = ({ children, ...props }) => {
  return (
    <nav>
      <ul {...props}>{children}</ul>
    </nav>
  );
};

Breadcrumbs.default = {
  className: 'flex items-center flex-wrap m-0 p-0 md:container md:mx-auto',
};

type ItemClasses<Props extends string> = Record<Props, ClassName>;
type ItemProps = React.HTMLAttributes<HTMLLIElement> & PropsWithChildren;

const Item: Breadcrumbs['Item'] = ({ children, ...props }) => {
  return <li {...props}>{children}</li>;
};

Item.default = {
  className: 'flex items-center text-black text-xs pl-1 first:pl-0',
};

Breadcrumbs.Item = Item;

interface PathProp {
  href?: string;
}

type PathClasses<Props extends string> = Record<Props, ClassName>;
type PathProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & PathProp & PropsWithChildren;

const Path: Breadcrumbs['Path'] = ({ children, href, ...props }) => {
  return (
    <Link {...props} href={href}>
      {children}
    </Link>
  );
};

Path.default = {
  className: 'font-semibold hover:text-[#053FB0] p-1 pl-0',
};

Path.lastItem = {
  className: 'font-extrabold p-1 pl-0 pointer-events-none',
};

Breadcrumbs.Path = Path;

type DividerClasses<Props extends string> = Record<Props, ClassName>;
type DividerProps = React.HTMLAttributes<HTMLSpanElement> & PropsWithChildren;

const Divider: Breadcrumbs['Divider'] = ({ children, ...props }) => {
  return <span {...props}>{children}</span>;
};

Divider.default = {
  className: 'my-0 mx-[5px]',
};

Breadcrumbs.Divider = Divider;
