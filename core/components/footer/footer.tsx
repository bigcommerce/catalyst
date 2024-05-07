import { FragmentOf, graphql } from '~/client/graphql';
import { Footer as ComponentsFooter, FooterSection } from '~/components/ui/footer';

import { StoreLogo, StoreLogoFragment } from '../store-logo';

import { ContactInformation, ContactInformationFragment } from './contact-information';
import { Copyright, CopyrightFragment } from './copyright';
import {
  BrandFooterMenu,
  BrandsFooterMenuFragment,
  CategoryFooterMenu,
  CategoryFooterMenuFragment,
} from './footer-menus';
import { WebPageFooterMenu, WebPageFooterMenuFragment } from './footer-menus/web-page-footer-menu';
import { PaymentMethods } from './payment-methods';
import { SocialIcons, SocialIconsFragment } from './social-icons';

export const FooterFragment = graphql(
  `
    fragment FooterFragment on Site {
      settings {
        ...ContactInformationFragment
        ...CopyrightFragment
        ...SocialIconsFragment
        ...StoreLogoFragment
      }
      content {
        ...WebPageFooterMenuFragment
      }
      brands(first: 5) {
        ...BrandsFooterMenuFragment
      }
      ...CategoryFooterMenuFragment
    }
  `,
  [
    BrandsFooterMenuFragment,
    CategoryFooterMenuFragment,
    ContactInformationFragment,
    CopyrightFragment,
    SocialIconsFragment,
    StoreLogoFragment,
    WebPageFooterMenuFragment,
  ],
);

interface Props {
  data: FragmentOf<typeof FooterFragment>;
}

export const Footer = ({ data }: Props) => {
  return (
    <ComponentsFooter>
      <FooterSection className="flex flex-col gap-8 py-10 md:flex-row lg:gap-4">
        <nav className="grid flex-auto auto-cols-fr gap-8 sm:grid-flow-col">
          <CategoryFooterMenu data={data.categoryTree} />
          <BrandFooterMenu data={data.brands} />
          <WebPageFooterMenu data={data.content} />
        </nav>

        <div className="flex flex-col gap-4 md:order-first md:grow">
          {data.settings && (
            <h3>
              <StoreLogo data={data.settings} />
            </h3>
          )}
          {data.settings && <ContactInformation data={data.settings} />}
          {data.settings && <SocialIcons data={data.settings} />}
        </div>
      </FooterSection>

      <FooterSection className="flex flex-col justify-between gap-10 sm:flex-row sm:gap-8 sm:py-6">
        <PaymentMethods />

        {data.settings && <Copyright data={data.settings} />}
      </FooterSection>
    </ComponentsFooter>
  );
};
