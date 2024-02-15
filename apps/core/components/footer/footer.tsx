import { Footer as ComponentsFooter, FooterSection } from '@bigcommerce/components/footer';

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
      <FooterSection className="flex flex-col gap-8 py-10 md:flex-row lg:gap-4">
        <nav className="grid flex-auto auto-cols-fr gap-8 sm:grid-flow-col">
          <CategoryFooterMenu />
          <BrandFooterMenu />
          <WebPageFooterMenu />
        </nav>
        <div className="flex flex-col gap-4 md:order-first md:grow">
          <h3>
            <StoreLogo />
          </h3>
          <ContactInformation />
          <SocialIcons />
        </div>
      </FooterSection>
      <FooterSection className="flex flex-col justify-between gap-10 sm:flex-row sm:gap-8 sm:py-6">
        <PaymentMethods />
        <Copyright />
      </FooterSection>
    </ComponentsFooter>
  );
};
