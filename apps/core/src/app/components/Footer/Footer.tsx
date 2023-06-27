import {
  FooterAddendum,
  FooterNav,
  FooterSection,
  Footer as ReactantFooter,
} from '@bigcommerce/reactant/Footer';
import React from 'react';

import { StoreLogo } from '../StoreLogo';

import { ContactInformation } from './ContactInformation';
import { Copyright } from './Copyright';
import { BaseFooterMenu, BrandFooterMenu, CategoryFooterMenu } from './FooterMenus';
import { PaymentMethods } from './PaymentMethods';
import { SocialIcons } from './SocialIcons';

export const Footer = () => {
  return (
    <ReactantFooter>
      <FooterSection className="md:flex-row">
        <FooterNav>
          <CategoryFooterMenu />
          <BrandFooterMenu />
          <BaseFooterMenu
            items={[
              { name: 'About us', path: '/about-us' },
              { name: 'Contact us', path: '/contact-us' },
              { name: 'Blog', path: '/blog' },
            ]}
            title="About us"
          />
          <BaseFooterMenu
            items={[
              { name: 'Shipping & returns', path: '/shipping-and-returns' },
              { name: 'Privacy policy', path: '/privacy-policy' },
              { name: 'Terms & conditions', path: '/terms-and-conditions' },
              { name: 'FAQ', path: '/faq' },
            ]}
            title="Help"
          />
        </FooterNav>
        <FooterSection className="shrink-0 grow gap-4 md:order-first">
          <h3 className="mb-4">
            <StoreLogo />
          </h3>
          <ContactInformation />
          <SocialIcons />
        </FooterSection>
      </FooterSection>
      <FooterAddendum className="justify-between">
        <PaymentMethods />
        <Copyright />
      </FooterAddendum>
    </ReactantFooter>
  );
};
