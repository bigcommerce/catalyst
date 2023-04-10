import { ComponentPropsWithoutRef } from 'react';

import { Link } from './Link';
import { ComponentClasses } from './types';

type BreadcrumbsProps = ComponentPropsWithoutRef<'ul'>;
type Breadcrumbs = React.FC<BreadcrumbsProps> &
  ComponentClasses<'default'> & {
    Item: React.FC<ItemProps> & ComponentClasses<'default'>;
    Path: React.FC<PathProps> & ComponentClasses<'default' | 'lastItem'>;
    Divider: React.FC<DividerProps> & ComponentClasses<'default'>;
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

type ItemProps = ComponentPropsWithoutRef<'li'>;

const Item: Breadcrumbs['Item'] = ({ children, ...props }) => {
  return <li {...props}>{children}</li>;
};

Item.default = {
  className: 'flex items-center text-black text-xs pl-1 first:pl-0',
};

Breadcrumbs.Item = Item;

type PathProps = ComponentPropsWithoutRef<'a'>;

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

type DividerProps = ComponentPropsWithoutRef<'span'>;

const Divider: Breadcrumbs['Divider'] = ({ children, ...props }) => {
  return <span {...props}>{children}</span>;
};

Divider.default = {
  className: 'my-0 mx-[5px]',
};

Breadcrumbs.Divider = Divider;
