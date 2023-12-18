import { FooterNav, FooterSection, Footer as ReactantFooter } from '@bigcommerce/reactant/Footer';
import React from 'react';

import { AvailableWebPages, getWebPages } from '~/client/queries/getWebPages';

import { StoreLogo } from '../StoreLogo';

import { ContactInformation } from './ContactInformation';
import { Copyright } from './Copyright';
import { BaseFooterMenu, BrandFooterMenu, CategoryFooterMenu } from './FooterMenus';
import { PaymentMethods } from './PaymentMethods';
import { SocialIcons } from './SocialIcons';

const filterActivePages = (availableStorePages: AvailableWebPages) =>
  availableStorePages.reduce<Array<{ name: string; path: string }>>((visiblePages, currentPage) => {
    if (currentPage.isVisibleInNavigation) {
      const { name, __typename } = currentPage;

      visiblePages.push({
        name,
        path: __typename === 'ExternalLinkPage' ? currentPage.link : currentPage.path,
      });

      return visiblePages;
    }

    return visiblePages;
  }, []);

const activeFooterWebPages = await (async (columnName: string) => {
  const storeWebPages = await getWebPages();

  return {
    title: columnName,
    items: filterActivePages(storeWebPages),
  };
})('About us');

const WebPageFooterMenu = () => {
  const { title, items } = activeFooterWebPages;

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
          <BaseFooterMenu
            items={[
              { name: 'About Us', path: '/about-us' },
              { name: 'FAQ', path: '/faq' },
            ]}
            title="Help"
          />
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
