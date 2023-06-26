import {
  FooterSiteMapCategory,
  FooterSiteMapCategoryItem,
  FooterSiteMapCategoryList,
  FooterSiteMapCategoryTitle,
} from '@bigcommerce/reactant/Footer';
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
    <FooterSiteMapCategory {...props}>
      <FooterSiteMapCategoryTitle>{title}</FooterSiteMapCategoryTitle>
      <FooterSiteMapCategoryList>
        {items.map((item) => (
          <FooterSiteMapCategoryItem key={item.path}>
            <Link href={item.path}>{item.name}</Link>
          </FooterSiteMapCategoryItem>
        ))}
      </FooterSiteMapCategoryList>
    </FooterSiteMapCategory>
  );
};
