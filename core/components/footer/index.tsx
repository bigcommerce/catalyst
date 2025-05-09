import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import {
  SiFacebook,
  SiInstagram,
  SiPinterest,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';
import { getTranslations } from 'next-intl/server';
import { cache, JSX } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { GetLinksAndSectionsQuery, LayoutQuery } from '~/app/[locale]/(default)/page-data';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { SiteFooter as FooterSection } from '~/lib/makeswift/components/site-footer/site-footer';

import { FooterFragment, FooterSectionsFragment } from './fragment';
import { AmazonIcon } from './payment-icons/amazon';
import { AmericanExpressIcon } from './payment-icons/american-express';
import { ApplePayIcon } from './payment-icons/apple-pay';
import { MastercardIcon } from './payment-icons/mastercard';
import { PayPalIcon } from './payment-icons/paypal';
import { VisaIcon } from './payment-icons/visa';

const paymentIcons = [
  <AmazonIcon key="amazon" />,
  <AmericanExpressIcon key="americanExpress" />,
  <ApplePayIcon key="apple" />,
  <MastercardIcon key="mastercard" />,
  <PayPalIcon key="paypal" />,
  <VisaIcon key="visa" />,
];

const socialIcons: Record<string, { icon: JSX.Element }> = {
  Facebook: { icon: <SiFacebook title="Facebook" /> },
  Twitter: { icon: <SiX title="Twitter" /> },
  X: { icon: <SiX title="X" /> },
  Pinterest: { icon: <SiPinterest title="Pinterest" /> },
  Instagram: { icon: <SiInstagram title="Instagram" /> },
  YouTube: { icon: <SiYoutube title="YouTube" /> },
};

const getFooterSections = cache(async (customerAccessToken?: string) => {
  const { data: response } = await client.fetch({
    document: GetLinksAndSectionsQuery,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return readFragment(FooterSectionsFragment, response).site;
});

const getFooterData = cache(async () => {
  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: { next: { revalidate } },
  });

  return readFragment(FooterFragment, response).site;
});

export const Footer = async () => {
  const t = await getTranslations('Components.Footer');

  const data = await getFooterData();

  const logo = data.settings ? logoTransformer(data.settings) : '';

  const copyright = `© ${new Date().getFullYear()} ${data.settings?.storeName} – Powered by BigCommerce`;

  const contactInformation = data.settings?.contact
    ? {
        address: data.settings.contact.address,
        phone: data.settings.contact.phone,
      }
    : undefined;

  const socialMediaLinks = data.settings?.socialMediaLinks
    .filter((socialMediaLink) => Boolean(socialIcons[socialMediaLink.name]))
    .map((socialMediaLink) => ({
      href: socialMediaLink.url,
      icon: socialIcons[socialMediaLink.name]?.icon,
    }));

  const streamableSections = Streamable.from(async () => {
    const customerAccessToken = await getSessionCustomerAccessToken();

    const sectionsData = await getFooterSections(customerAccessToken);

    return [
      {
        title: t('categories'),
        links: sectionsData.categoryTree.map((category) => ({
          label: category.name,
          href: category.path,
        })),
      },
      {
        title: t('brands'),
        links: removeEdgesAndNodes(sectionsData.brands).map((brand) => ({
          label: brand.name,
          href: brand.path,
        })),
      },
      {
        title: t('navigate'),
        links: removeEdgesAndNodes(sectionsData.content.pages).map((page) => ({
          label: page.name,
          href: page.__typename === 'ExternalLinkPage' ? page.link : page.path,
        })),
      },
    ];
  });

  return (
    <FooterSection
      contactInformation={contactInformation}
      contactTitle={t('contactUs')}
      copyright={copyright}
      logo={logo}
      logoHref="/"
      logoLabel={t('home')}
      paymentIcons={paymentIcons}
      sections={streamableSections}
      socialMediaLinks={socialMediaLinks}
    />
  );
};
