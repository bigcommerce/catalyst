import { FooterNav, FooterSection, Footer as ReactantFooter } from '@bigcommerce/reactant/Footer';
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
