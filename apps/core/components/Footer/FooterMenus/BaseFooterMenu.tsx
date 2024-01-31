import { FooterNavGroupList, FooterNavLink } from '@bigcommerce/reactant/Footer';
import React, { ComponentPropsWithoutRef } from 'react';

// import { Link } from '~/components/OldLink';
import { NavLink } from '~/components/NavLink';

interface Item {
  name: string;
  path: string;
}

interface Props {
  title: string;
  items: Item[];
}

export const BaseFooterMenu = ({
  title,
  items,
  ...props
}: Props & ComponentPropsWithoutRef<'div'>) => {
  return (
    <div {...props}>
      <h3 className="mb-4 font-bold">{title}</h3>
      <FooterNavGroupList>
        {items.map((item) => (
          <FooterNavLink asChild key={item.path}>
            <NavLink href={item.path}>{item.name}</NavLink>
          </FooterNavLink>
        ))}
      </FooterNavGroupList>
    </div>
  );
};
