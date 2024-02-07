import { FooterNavGroupList, FooterNavLink } from '@bigcommerce/components/footer';
import React, { ComponentPropsWithoutRef } from 'react';

import { Link } from '~/components/link';

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
      <h3 className="mb-4 text-lg font-bold">{title}</h3>
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
