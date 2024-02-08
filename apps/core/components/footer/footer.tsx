import {
  Footer as ComponentsFooter,
  FooterNav,
  FooterSection,
} from '@bigcommerce/components/footer';

import { StoreLogo } from '../store-logo';

import { ContactInformation } from './contact-information';
import { Copyright } from './copyright';
import { BrandFooterMenu, CategoryFooterMenu } from './footer-menus';
import { WebPageFooterMenu } from './footer-menus/web-page-footer-menu';
import { PaymentMethods } from './payment-methods';
import { SocialIcons } from './social-icons';

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
