import {
  Footer as ComponentsFooter,
  FooterNav,
  FooterSection,
} from '@bigcommerce/components/Footer';
import React from 'react';

import { AvailableWebPages, getWebPages } from '~/client/queries/get-web-pages';

import { StoreLogo } from '../store-logo';

import { ContactInformation } from './contact-information';
import { Copyright } from './copyright';
import { BaseFooterMenu, BrandFooterMenu, CategoryFooterMenu } from './footer-menus';
import { PaymentMethods } from './payment-methods';
import { SocialIcons } from './social-icons';

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
})('Navigate');

const WebPageFooterMenu = () => {
  const { title, items } = activeFooterWebPages;

  if (items.length > 0) {
    return <BaseFooterMenu items={items} title={title} />;
  }

  return null;
};

export const Footer = () => {
  return (
    <ComponentsFooter>
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
    </ComponentsFooter>
  );
};
