import { FooterNav, FooterSection, Footer as ReactantFooter } from '@bigcommerce/reactant/Footer';
import React from 'react';

import { getWebPages } from '~/client/queries/getWebPages';

import { StoreLogo } from '../StoreLogo';

import { ContactInformation } from './ContactInformation';
import { Copyright } from './Copyright';
import { BaseFooterMenu, BrandFooterMenu, CategoryFooterMenu } from './FooterMenus';
import { PaymentMethods } from './PaymentMethods';
import { SocialIcons } from './SocialIcons';

const footerWebPages = await (async (columnName: string) => {
  const footerPages = await getWebPages({
    navigationOnly: true,
    first: 5,
  });

  return {
    title: columnName,
    items: footerPages.map((page: { link?: any; path?: any; name?: any; __typename?: any; }) => {
      const { name, __typename } = page;

      return {
        name,
        path: __typename === 'ExternalLinkPage' ? page.link : page.path,
      };
    }),
  };
})('Navigate');

const WebPageFooterMenu = () => {
  const { title, items } = footerWebPages;

  if (items.length > 0) {
    return <BaseFooterMenu items={items} title={title} />;
  }

  return null;
};

export const Footer = () => {
  return (
    <ReactantFooter>
      <FooterSection>
        <FooterNav>
          <CategoryFooterMenu />
          <BrandFooterMenu />
          <WebPageFooterMenu />
        </FooterNav>
        <div className="flex shrink-0 grow flex-col gap-4 md:order-first">
          <h3 className="mb-4">
            <StoreLogo />
          </h3>
          <ContactInformation />
          <SocialIcons />
        </div>
      </FooterSection>
      <FooterSection className="justify-between gap-10 sm:flex-row sm:gap-8 sm:py-6">
        <PaymentMethods />
        <Copyright />
      </FooterSection>
    </ReactantFooter>
  );
};
