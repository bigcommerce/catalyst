import { FooterNavGroupList, FooterNavLink } from '@bigcommerce/reactant/Footer';
import Link from 'next/link';
import React, { ComponentPropsWithoutRef } from 'react';

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
            <Link href={item.path}>{item.name}</Link>
          </FooterNavLink>
        ))}
      </FooterNavGroupList>
    </div>
  );
};
